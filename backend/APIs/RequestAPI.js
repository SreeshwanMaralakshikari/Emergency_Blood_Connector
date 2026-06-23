import exp from 'express'
import {createNotification} from '../utils/createNotification.js'
import {BloodRequestModel} from '../models/BloodRequestModel.js'
import {DonationModel} from '../models/DonationModel.js'
import {UserModel} from '../models/UserModel.js'
import {verifyToken} from '../middlewares/verifyToken.js'
import {calculateExpiryDate} from '../utils/requestExpiry.js'
import {calculatePriorityScore} from '../utils/calculatePriorityScore.js'
import {generateRequestNumber} from '../utils/generateRequestNumber.js'
import {calculatePoints} from '../utils/calculatePoints.js'
import {calculateLevel} from '../utils/calculateLevel.js'
import {calculateNextEligibleDate} from '../utils/donationCooldown.js'
import {calculateBadges} from '../utils/calculateBadges.js'

export const requestApp=exp.Router();


// CREATE BLOOD REQUEST
requestApp.post("/create-request",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const requestData=req.body;

        //generate unique request number — use total count as base
        //sort descending to find the highest existing number and increment from there
        const lastRequest=await BloodRequestModel.findOne().sort({createdAt:-1}).select("requestNumber");
        const requestCount=await BloodRequestModel.countDocuments();
        const base=Math.max(requestCount, lastRequest ? parseInt(lastRequest.requestNumber.split("-")[2]) || 0 : 0);
        const requestNumber=generateRequestNumber(base);

        //build request object
        const bloodRequestData={
            requestNumber,
            patientName:requestData.patientName,
            patientAge:requestData.patientAge,
            patientGender:requestData.patientGender,
            bloodGroup:requestData.bloodGroup,
            unitsRequired:requestData.unitsRequired,
            hospitalName:requestData.hospitalName,
            hospitalAddress:requestData.hospitalAddress,
            state:requestData.state,
            contactPerson:requestData.contactPerson,
            contactNumber:requestData.contactNumber,
            alertLevel:requestData.alertLevel,
            requiredByDate:requestData.requiredByDate,
            requestCreatedBy:req.user.userId,
            status:"OPEN",
            priorityScore:calculatePriorityScore(requestData.alertLevel,requestData.unitsRequired),
            expiresAt:calculateExpiryDate(requestData.alertLevel),
            unitsFulfilled:0,
            acceptedDonors:[],
            completedDonors:[],
            isHospitalVerified:false
        };

        //save to db
        const createdRequest=await BloodRequestModel.create(bloodRequestData);

        //notify requester (non-critical — request is already saved)
        try
        {
            await createNotification(
                req.user.userId,
                "Blood Request Created",
                `Request ${requestNumber} has been created successfully`,
                "REQUEST_CREATED"
            );
        }
        catch(notifErr)
        {
            console.error("create-request notification failed",notifErr.message);
        }

        //send res
        res.status(201).json({message:"Blood Request Created Successfully",payload:createdRequest});
    }
    catch(err)
    {
        next(err);
    }
});


// GET ALL OPEN REQUESTS
requestApp.get("/open-requests",async(req,res,next)=>{
    try
    {
        //auto-expire any overdue requests before returning open list
        await BloodRequestModel.updateMany(
            {status:"OPEN",expiresAt:{$lt:new Date()}},
            {$set:{status:"EXPIRED"}}
        );

        //get open requests sorted by priority score
        const requestsList=await BloodRequestModel.find({status:"OPEN"}).sort({priorityScore:-1,createdAt:-1});

        //send res
        res.status(200).json({message:"Open Requests Fetched Successfully",payload:requestsList});
    }
    catch(err)
    {
        next(err);
    }
});


// GET MY REQUESTS
requestApp.get("/my-requests",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        //auto-expire any overdue open requests before fetching
        await BloodRequestModel.updateMany(
            {requestCreatedBy:req.user.userId,status:"OPEN",expiresAt:{$lt:new Date()}},
            {$set:{status:"EXPIRED"}}
        );

        //get requests by this requester (excluding deleted)
        const requests=await BloodRequestModel.find({
            requestCreatedBy:req.user.userId,
            status:{$ne:"DELETED"}
        }).sort({createdAt:-1});

        //send res
        res.status(200).json({message:"My Requests Fetched Successfully",payload:requests});
    }
    catch(err)
    {
        next(err);
    }
});


// GET REQUEST DETAILS (public)
// open to all — auth is optional; ownership check only applied to REQUESTER role
requestApp.get("/request/:requestNumber",async(req,res,next)=>{
    try
    {
        const {requestNumber}=req.params;

        //find request (excluding deleted) and populate donor names in pendingConfirmation
        const request=await BloodRequestModel.findOne({requestNumber,status:{$ne:"DELETED"}})
            .populate("pendingConfirmation.donorId","firstName lastName bloodGroup");
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }

        //send res
        res.status(200).json({message:"Request Details Fetched Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});


// EDIT BLOOD REQUEST
requestApp.put("/edit-request",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const {
            requestNumber,patientName,patientAge,patientGender,bloodGroup,
            unitsRequired,hospitalName,hospitalAddress,state,contactPerson,
            contactNumber,alertLevel,requiredByDate
        }=req.body;

        //find request
        const request=await BloodRequestModel.findOne({requestNumber,status:{$ne:"DELETED"}});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }

        //check ownership (admin can edit any request)
        if(req.user.role!=="ADMIN" && String(request.requestCreatedBy)!==String(req.user.userId))
        {
            return res.status(403).json({message:"You are not authorized to edit this request"});
        }

        //only open requests can be edited
        if(request.status!=="OPEN")
        {
            return res.status(400).json({message:"Only OPEN requests can be edited"});
        }

        //update fields
        request.patientName=patientName;
        request.patientAge=patientAge;
        request.patientGender=patientGender;
        request.bloodGroup=bloodGroup;
        request.unitsRequired=unitsRequired;
        request.hospitalName=hospitalName;
        request.hospitalAddress=hospitalAddress;
        request.state=state;
        request.contactPerson=contactPerson;
        request.contactNumber=contactNumber;
        request.alertLevel=alertLevel;
        request.requiredByDate=requiredByDate;
        request.priorityScore=calculatePriorityScore(alertLevel,unitsRequired);
        request.expiresAt=calculateExpiryDate(alertLevel);
        await request.save();

        //notify requester (non-critical — request is already saved)
        try
        {
            await createNotification(req.user.userId,"Blood Request Updated",`Request ${requestNumber} has been updated`,"GENERAL");
        }
        catch(notifErr)
        {
            console.error("edit-request notification failed",notifErr.message);
        }

        //send res
        res.status(200).json({message:"Blood Request Updated Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});


// CLOSE BLOOD REQUEST
requestApp.patch("/close-request",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const {requestNumber}=req.body;

        //find request
        const request=await BloodRequestModel.findOne({requestNumber});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }

        //check ownership (admin can close any request)
        if(req.user.role!=="ADMIN" && String(request.requestCreatedBy)!==String(req.user.userId))
        {
            return res.status(403).json({message:"You are not authorized to close this request"});
        }

        //check status
        if(request.status==="FULFILLED")
        {
            return res.status(400).json({message:"Fulfilled request cannot be closed"});
        }
        if(request.status==="CLOSED")
        {
            return res.status(400).json({message:"Request already closed"});
        }
        if(request.status==="EXPIRED")
        {
            return res.status(400).json({message:"Expired request cannot be closed"});
        }
        if(request.status==="DELETED")
        {
            return res.status(400).json({message:"Deleted request cannot be closed"});
        }

        //close request
        request.status="CLOSED";
        await request.save();

        //notify requester (non-critical — request is already saved)
        try
        {
            await createNotification(req.user.userId,"Blood Request Closed",`Request ${requestNumber} has been closed`,"GENERAL");
        }
        catch(notifErr)
        {
            console.error("close-request notification failed",notifErr.message);
        }

        //send res
        res.status(200).json({message:"Blood Request Closed Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});


// DELETE BLOOD REQUEST (soft delete)
requestApp.patch("/delete-request",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const {requestNumber}=req.body;

        //find request
        const request=await BloodRequestModel.findOne({requestNumber});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }

        //check ownership (admin can delete any request)
        if(req.user.role!=="ADMIN" && String(request.requestCreatedBy)!==String(req.user.userId))
        {
            return res.status(403).json({message:"You are not authorized to delete this request"});
        }

        //check status
        if(request.status==="FULFILLED")
        {
            return res.status(400).json({message:"Fulfilled request cannot be deleted"});
        }
        if(request.status==="DELETED")
        {
            return res.status(400).json({message:"Request already deleted"});
        }

        //soft delete
        request.status="DELETED";
        await request.save();

        //notify requester (non-critical — request is already saved)
        try
        {
            await createNotification(req.user.userId,"Blood Request Deleted",`Request ${requestNumber} has been deleted`,"GENERAL");
        }
        catch(notifErr)
        {
            console.error("delete-request notification failed",notifErr.message);
        }

        //send res
        res.status(200).json({message:"Blood Request Deleted Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});


// REQUESTER DASHBOARD
requestApp.get("/dashboard",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        //get all non-deleted requests by this requester
        const requests=await BloodRequestModel.find({
            requestCreatedBy:req.user.userId,
            status:{$ne:"DELETED"}
        });

        //calculate stats
        const totalRequests=requests.length;
        const openRequests=requests.filter((r)=>r.status==="OPEN").length;
        const fulfilledRequests=requests.filter((r)=>r.status==="FULFILLED").length;
        const totalUnitsRequired=requests.reduce((sum,request)=>sum+request.unitsRequired,0);
        const totalUnitsFulfilled=requests.reduce((sum,request)=>sum+request.unitsFulfilled,0);

        //send res
        res.status(200).json({
            message:"Requester Dashboard",
            payload:{totalRequests,openRequests,fulfilledRequests,totalUnitsRequired,totalUnitsFulfilled}
        });
    }
    catch(err)
    {
        next(err);
    }
});


// CONFIRM DONATION — requester verifies that a donor actually donated at the hospital
// This awards points, sets cooldown, and increments unitsFulfilled
requestApp.patch("/confirm-donation",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const {requestNumber,donorId}=req.body;

        if(!requestNumber || !donorId)
        {
            return res.status(400).json({message:"requestNumber and donorId are required"});
        }

        //find request
        const request=await BloodRequestModel.findOne({requestNumber});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }

        //only the requester who created this request (or admin) can confirm donations
        if(req.user.role!=="ADMIN" && String(request.requestCreatedBy)!==String(req.user.userId))
        {
            return res.status(403).json({message:"You are not authorized to confirm donations for this request"});
        }

        //deleted requests cannot have donations confirmed
        if(request.status==="DELETED")
        {
            return res.status(400).json({message:"Cannot confirm a donation on a deleted request"});
        }

        //find this donor in the pendingConfirmation list
        const pendingEntry=request.pendingConfirmation.find(
            (p)=>String(p.donorId)===String(donorId)
        );
        if(!pendingEntry)
        {
            return res.status(404).json({message:"No pending donation found for this donor on this request"});
        }

        //get the pending donation record
        const donationRecord=await DonationModel.findById(pendingEntry.donationId);
        if(!donationRecord)
        {
            return res.status(404).json({message:"Donation record not found"});
        }

        //get donor
        const donor=await UserModel.findById(donorId);
        if(!donor)
        {
            return res.status(404).json({message:"Donor Not Found"});
        }

        //confirm the donation record
        donationRecord.status="CONFIRMED";
        donationRecord.isVerified=true;
        await donationRecord.save();

        //award points and apply donation cooldown to donor
        const oldBadges=donor.badges || [];
        donor.totalPoints+=donationRecord.pointsAwarded;
        donor.donationsCount+=1;
        donor.donorLevel=calculateLevel(donor.totalPoints);
        const newBadges=calculateBadges(donor.donationsCount,donor.totalPoints);
        donor.badges=newBadges;
        donor.lastDonationDate=donationRecord.donationDate;
        donor.nextEligibleDonationDate=donationRecord.nextEligibleDonationDate;
        donor.isAvailable=false;
        donor.availabilityUpdatedAt=new Date();
        await donor.save();

        //update request — move donor from pendingConfirmation to completedDonors
        request.pendingConfirmation=request.pendingConfirmation.filter(
            (p)=>String(p.donorId)!==String(donorId)
        );
        request.completedDonors.push(donor._id);
        request.unitsFulfilled+=1;
        if(request.unitsFulfilled>=request.unitsRequired)
        {
            request.status="FULFILLED";
        }
        await request.save();

        //notify donor their donation is confirmed and points awarded (non-critical)
        try
        {
            await createNotification(
                donor._id,
                "Donation Confirmed",
                `Your donation for request ${request.requestNumber} has been confirmed. You earned ${donationRecord.pointsAwarded} point${donationRecord.pointsAwarded!==1?"s":""}!`,
                "DONATION_CONFIRMED"
            );
        }
        catch(error)
        {
            console.error(error);
        }

        //notify donor of each new badge earned (non-critical)
        const earnedBadges=newBadges.filter((badge)=>!oldBadges.includes(badge));
        for(const badge of earnedBadges)
        {
            try
            {
                await createNotification(donor._id,"New Badge Earned",`Congratulations! You earned the badge "${badge}"`,"BADGE_EARNED");
            }
            catch(error)
            {
                console.error(error);
            }
        }

        //send res
        res.status(200).json({
            message:"Donation confirmed successfully",
            payload:{request,donation:donationRecord}
        });
    }
    catch(err)
    {
        next(err);
    }
});


// HEALTH CHECK
requestApp.get("/",(req,res)=>{
    res.json({message:"Request API Working"});
});
