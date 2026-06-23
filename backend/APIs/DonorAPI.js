import exp from 'express'
import {verifyToken} from '../middlewares/verifyToken.js'
import {UserModel} from '../models/UserModel.js'
import {BloodRequestModel} from '../models/BloodRequestModel.js'
import {DonationModel} from '../models/DonationModel.js'
import {calculatePoints} from '../utils/calculatePoints.js'
import {calculateLevel} from '../utils/calculateLevel.js'
import {calculateNextEligibleDate} from '../utils/donationCooldown.js'
import {canDonate} from '../utils/bloodCompatibility.js'
import {calculateBadges} from '../utils/calculateBadges.js'
import {createNotification} from '../utils/createNotification.js'

export const donorApp=exp.Router();


// GET MY MATCHED REQUESTS
donorApp.get("/my-matched-requests",verifyToken("DONOR"),async(req,res,next)=>{
    try
    {
        //get donor from db
        const donor=await UserModel.findById(req.user.userId);
        if(!donor)
        {
            return res.status(404).json({message:"Donor Not Found"});
        }

        //get open requests in donor's state then filter by blood compatibility
        const allOpenRequests=await BloodRequestModel.find({status:"OPEN",state:donor.state}).sort({priorityScore:-1,createdAt:-1});
        const matchedRequests=allOpenRequests.filter((request)=>canDonate(donor.bloodGroup,request.bloodGroup));

        //send res
        res.status(200).json({message:"Matched Requests Fetched Successfully",payload:matchedRequests});
    }
    catch(err)
    {
        next(err);
    }
});


// GET MY ACCEPTED REQUESTS
donorApp.get("/my-accepted-requests",verifyToken("DONOR"),async(req,res,next)=>{
    try
    {
        const donorId=req.user.userId;

        //get requests accepted by this donor
        const requests=await BloodRequestModel.find({
            acceptedDonors:{$elemMatch:{donorId}}
        }).sort({priorityScore:-1,createdAt:-1});

        //format response with acceptance timestamp
        const formattedRequests=requests.map((request)=>{
            const donorAcceptance=request.acceptedDonors.find(
                (donorObj)=>String(donorObj.donorId)===String(donorId)
            );
            return {
                requestId:request._id,
                requestNumber:request.requestNumber,
                patientName:request.patientName,
                bloodGroup:request.bloodGroup,
                alertLevel:request.alertLevel,
                hospitalName:request.hospitalName,
                hospitalAddress:request.hospitalAddress,
                contactPerson:request.contactPerson,
                contactNumber:request.contactNumber,
                unitsRequired:request.unitsRequired,
                unitsFulfilled:request.unitsFulfilled,
                status:request.status,
                acceptedAt:donorAcceptance?.acceptedAt
            };
        });

        //send res
        res.status(200).json({message:"Accepted Requests Fetched Successfully",payload:formattedRequests});
    }
    catch(err)
    {
        next(err);
    }
});


// GET DONATION HISTORY
donorApp.get("/donation-history",verifyToken("DONOR"),async(req,res,next)=>{
    try
    {
        const donorId=req.user.userId;

        //get all donations by this donor sorted by date
        const donations=await DonationModel.find({donorId}).sort({donationDate:-1});

        //send res
        res.status(200).json({message:"Donation History Fetched Successfully",payload:donations});
    }
    catch(err)
    {
        next(err);
    }
});


// GET MY BADGES
donorApp.get("/badges",verifyToken("DONOR"),async(req,res,next)=>{
    try
    {
        //get donor stats from db
        const donor=await UserModel.findById(req.user.userId).select("donorLevel totalPoints donationsCount");
        if(!donor)
        {
            return res.status(404).json({message:"Donor Not Found"});
        }

        //calculate badges based on current stats
        const badges=calculateBadges(donor.donationsCount,donor.totalPoints);

        //send res
        res.status(200).json({
            message:"Badges Fetched Successfully",
            payload:{donationsCount:donor.donationsCount,totalPoints:donor.totalPoints,donorLevel:donor.donorLevel,badges}
        });
    }
    catch(err)
    {
        next(err);
    }
});


// GET LEADERBOARD
donorApp.get("/leaderboard",async(req,res,next)=>{
    try
    {
        //get all donors sorted by points then donation count
        const donors=await UserModel.find({role:"DONOR"})
            .select("firstName lastName donorLevel totalPoints donationsCount")
            .sort({totalPoints:-1,donationsCount:-1});

        //build leaderboard with rank
        const leaderboard=donors.map((donor,index)=>({
            rank:index+1,
            donorId:donor._id,
            donorName:`${donor.firstName} ${donor.lastName}`,
            donorLevel:donor.donorLevel,
            totalPoints:donor.totalPoints,
            donationsCount:donor.donationsCount
        }));

        //send res
        res.status(200).json({message:"Leaderboard Fetched Successfully",payload:leaderboard});
    }
    catch(err)
    {
        next(err);
    }
});


// GET TOP 3 DONORS
donorApp.get("/top-donors",async(req,res,next)=>{
    try
    {
        //get top 3 donors by points
        const topDonors=await UserModel.find({role:"DONOR"})
            .select("firstName lastName donorLevel totalPoints donationsCount")
            .sort({totalPoints:-1,donationsCount:-1})
            .limit(3);

        //send res
        res.status(200).json({message:"Top Donors Fetched Successfully",payload:topDonors});
    }
    catch(err)
    {
        next(err);
    }
});


// GET MY RANK
donorApp.get("/my-rank",verifyToken("DONOR"),async(req,res,next)=>{
    try
    {
        const donorId=req.user.userId;

        //get all donors sorted by points to determine rank
        const donors=await UserModel.find({role:"DONOR"})
            .select("firstName lastName donorLevel totalPoints donationsCount")
            .sort({totalPoints:-1,donationsCount:-1});

        //find rank and donor info
        const donorIndex=donors.findIndex((donor)=>String(donor._id)===String(donorId));
        const donor=donors[donorIndex];
        if(!donor || donorIndex===-1)
        {
            return res.status(404).json({message:"Donor Not Found"});
        }
        const rank=donorIndex+1;

        //send res
        res.status(200).json({
            message:"Rank Fetched Successfully",
            payload:{
                rank,
                donorId:donor._id,
                donorName:`${donor.firstName} ${donor.lastName}`,
                donorLevel:donor.donorLevel,
                totalPoints:donor.totalPoints,
                donationsCount:donor.donationsCount
            }
        });
    }
    catch(err)
    {
        next(err);
    }
});


// GET MY ACHIEVEMENTS
donorApp.get("/achievements",verifyToken("DONOR"),async(req,res,next)=>{
    try
    {
        //get donor stats from db
        const donor=await UserModel.findById(req.user.userId).select("donationsCount totalPoints donorLevel");
        if(!donor)
        {
            return res.status(404).json({message:"Donor Not Found"});
        }

        //calculate badges
        const badges=calculateBadges(donor.donationsCount,donor.totalPoints);

        //send res
        res.status(200).json({
            message:"Achievements Fetched Successfully",
            payload:{
                donorLevel:donor.donorLevel,
                totalPoints:donor.totalPoints,
                donationsCount:donor.donationsCount,
                badgesUnlocked:badges.length,
                badges
            }
        });
    }
    catch(err)
    {
        next(err);
    }
});


// DONOR DASHBOARD
donorApp.get("/dashboard",verifyToken("DONOR"),async(req,res,next)=>{
    try
    {
        //get donor from db
        const donor=await UserModel.findById(req.user.userId).select("-password");
        if(!donor)
        {
            return res.status(404).json({message:"Donor Not Found"});
        }

        //count blood-compatible open requests in donor's state
        const totalMatchedRequests=(
            await BloodRequestModel.find({status:"OPEN",state:donor.state})
        ).filter((request)=>canDonate(donor.bloodGroup,request.bloodGroup)).length;

        //count accepted and completed donations
        const totalAcceptedRequests=await BloodRequestModel.countDocuments({
            acceptedDonors:{$elemMatch:{donorId:donor._id}}
        });
        //only count confirmed donations — pending ones are not yet verified by requester
        const totalDonations=await DonationModel.countDocuments({donorId:donor._id,status:"CONFIRMED"});

        //send res
        res.status(200).json({
            message:"Dashboard Data",
            payload:{
                donorName:`${donor.firstName} ${donor.lastName}`,
                bloodGroup:donor.bloodGroup,
                donorLevel:donor.donorLevel,
                totalPoints:donor.totalPoints,
                donationsCount:donor.donationsCount,
                isAvailable:donor.isAvailable,
                badges:donor.badges || [],
                lastDonationDate:donor.lastDonationDate,
                nextEligibleDonationDate:donor.nextEligibleDonationDate,
                totalMatchedRequests,
                totalAcceptedRequests,
                totalDonations
            }
        });
    }
    catch(err)
    {
        next(err);
    }
});


// ACCEPT BLOOD REQUEST
donorApp.put("/accept-request",verifyToken("DONOR"),async(req,res,next)=>{
    try
    {
        const {requestNumber}=req.body;
        const donorId=req.user.userId;

        //get donor from db
        const donor=await UserModel.findById(donorId);
        if(!donor)
        {
            return res.status(404).json({message:"Donor Not Found"});
        }

        //check donation cooldown
        if(!donor.isAvailable)
        {
            const eligibleDate=donor.nextEligibleDonationDate
                ? new Date(donor.nextEligibleDonationDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
                : "soon";
            return res.status(400).json({
                message:`You are in a donation cooldown period. You can donate again from ${eligibleDate}.`,
                nextEligibleDonationDate:donor.nextEligibleDonationDate
            });
        }

        //block if donor already has a pending donation awaiting confirmation on any request
        const hasPendingDonation=await DonationModel.exists({donorId:donor._id,status:"PENDING"});
        if(hasPendingDonation)
        {
            return res.status(400).json({message:"You have a donation awaiting requester confirmation. You cannot accept another request until it is confirmed."});
        }

        //find request
        const request=await BloodRequestModel.findOne({requestNumber});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }

        //validate request status
        if(request.status!=="OPEN")
        {
            return res.status(400).json({message:"This blood request is no longer open"});
        }
        if(request.unitsFulfilled>=request.unitsRequired)
        {
            return res.status(400).json({message:"This blood request has already been fulfilled"});
        }

        //check state and blood group eligibility
        if(request.state!==donor.state)
        {
            return res.status(403).json({message:`This request is in ${request.state} but you are registered in ${donor.state}. You can only accept requests in your registered state.`});
        }
        if(!canDonate(donor.bloodGroup,request.bloodGroup))
        {
            return res.status(403).json({message:`Your blood group (${donor.bloodGroup}) is not compatible with this request (needs ${request.bloodGroup}).`});
        }

        //check if already accepted
        if(request.acceptedDonors.some((donorObj)=>String(donorObj.donorId)===String(donorId)))
        {
            return res.status(400).json({message:"You have already accepted this request"});
        }

        //add donor to accepted list
        request.acceptedDonors.push({donorId,acceptedAt:new Date()});
        await request.save();

        //notify requester (non-critical)
        try
        {
            if(request.requestCreatedBy)
            {
                await createNotification(
                    request.requestCreatedBy,
                    "Request Accepted",
                    `${donor.firstName} ${donor.lastName} accepted request ${request.requestNumber}`,
                    "REQUEST_ACCEPTED"
                );
            }
        }
        catch(error)
        {
            console.error(error);
        }

        //send res
        res.status(200).json({message:"Donation Request Accepted Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});


// MARK DONATED — donor signals they have donated; creates a PENDING record awaiting requester confirmation
donorApp.put("/complete-donation",verifyToken("DONOR"),async(req,res,next)=>{
    try
    {
        const {requestNumber}=req.body;
        const donorId=req.user.userId;

        //find request
        const request=await BloodRequestModel.findOne({requestNumber});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }

        //validate request status
        if(request.status!=="OPEN")
        {
            return res.status(400).json({message:"This blood request is no longer open"});
        }
        if(request.unitsFulfilled>=request.unitsRequired)
        {
            return res.status(400).json({message:"This blood request has already been fulfilled"});
        }

        //check if donor accepted this request
        const donorAccepted=request.acceptedDonors.some((donorObj)=>String(donorObj.donorId)===String(donorId));
        if(!donorAccepted)
        {
            return res.status(400).json({message:"You have not accepted this request"});
        }

        //check if already confirmed (fully completed)
        if(request.completedDonors.some((id)=>String(id)===String(donorId)))
        {
            return res.status(400).json({message:"Your donation has already been confirmed"});
        }

        //check if already pending confirmation on THIS request
        if(request.pendingConfirmation.some((p)=>String(p.donorId)===String(donorId)))
        {
            return res.status(400).json({message:"You have already marked this donation — awaiting requester confirmation"});
        }

        //block if donor already has a pending donation on ANY other request
        const hasPendingElsewhere=await DonationModel.exists({donorId,status:"PENDING"});
        if(hasPendingElsewhere)
        {
            return res.status(400).json({message:"You have a donation awaiting confirmation on another request. Please wait for the requester to confirm before marking another donation."});
        }

        //get donor from db
        const donor=await UserModel.findById(donorId);
        if(!donor)
        {
            return res.status(404).json({message:"Donor Not Found"});
        }

        //check availability
        if(!donor.isAvailable)
        {
            const eligibleDate=donor.nextEligibleDonationDate
                ? new Date(donor.nextEligibleDonationDate).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})
                : "soon";
            return res.status(400).json({
                message:`You are in a donation cooldown period. You can donate again from ${eligibleDate}.`,
                nextEligibleDonationDate:donor.nextEligibleDonationDate
            });
        }

        //create a PENDING donation record — points/cooldown applied only after requester confirms
        const donationDate=new Date();
        const pointsAwarded=calculatePoints(request.alertLevel);
        const nextEligibleDonationDate=calculateNextEligibleDate(donationDate);

        const donationRecord=await DonationModel.create({
            donorId:donor._id,
            bloodRequestId:request._id,
            requestNumber:request.requestNumber,
            alertLevel:request.alertLevel,
            pointsAwarded,
            unitsDonated:1,
            donationDate,
            nextEligibleDonationDate,
            status:"PENDING",
            isVerified:false
        });

        //move donor from acceptedDonors to pendingConfirmation
        request.acceptedDonors=request.acceptedDonors.filter((donorObj)=>String(donorObj.donorId)!==String(donorId));
        request.pendingConfirmation.push({
            donorId:donor._id,
            donationId:donationRecord._id,
            donatedAt:donationDate
        });
        await request.save();

        //notify requester to confirm (non-critical)
        try
        {
            if(request.requestCreatedBy)
            {
                await createNotification(
                    request.requestCreatedBy,
                    "Donation Awaiting Confirmation",
                    `${donor.firstName} ${donor.lastName} has donated for request ${request.requestNumber}. Please confirm their donation.`,
                    "DONATION_COMPLETED"
                );
            }
        }
        catch(error)
        {
            console.error(error);
        }

        //send res
        res.status(200).json({message:"Donation marked successfully. Awaiting requester confirmation.",donation:donationRecord,request});
    }
    catch(err)
    {
        next(err);
    }
});


// HEALTH CHECK
donorApp.get("/",(req,res)=>{
    res.json({message:"Donor API Working"});
});
