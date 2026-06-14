import exp from 'express'
import {createNotification} from '../utils/createNotification.js'
import {BloodRequestModel} from '../models/BloodRequestModel.js'
import {verifyToken} from '../middlewares/verifyToken.js'
import {calculateExpiryDate} from '../utils/requestExpiry.js'
import {calculatePriorityScore} from '../utils/calculatePriorityScore.js'
import {generateRequestNumber} from '../utils/generateRequestNumber.js'

export const requestApp=exp.Router();

// Create Blood Request — POST /request-api/create-request
requestApp.post("/create-request",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const requestData=req.body;
        // generate unique request number
        const requestCount=await BloodRequestModel.countDocuments();
        const requestNumber=generateRequestNumber(requestCount);
        // build request object
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
        // save to db
        const createdRequest=await BloodRequestModel.create(bloodRequestData);
        // notify requester
        await createNotification(
            req.user.userId,
            "Blood Request Created",
            `Request ${requestNumber} has been created successfully`,
            "REQUEST_CREATED"
        );
        // send res
        res.status(201).json({message:"Blood Request Created Successfully",payload:createdRequest});
    }
    catch(err)
    {
        next(err);
    }
});

// Get All Open Requests (public) — GET /request-api/open-requests
requestApp.get("/open-requests",async(req,res,next)=>{
    try
    {
        // get open requests sorted by priority score
        const requestsList=await BloodRequestModel.find({status:"OPEN"}).sort({priorityScore:-1,createdAt:-1});
        // send res
        res.status(200).json({message:"Open Requests Fetched Successfully",payload:requestsList});
    }
    catch(err)
    {
        next(err);
    }
});

// Get My Requests — GET /request-api/my-requests
requestApp.get("/my-requests",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        // get requests by this requester (excluding deleted)
        const requests=await BloodRequestModel.find({
            requestCreatedBy:req.user.userId,
            status:{$ne:"DELETED"}
        }).sort({createdAt:-1});
        // send res
        res.status(200).json({message:"My Requests Fetched Successfully",payload:requests});
    }
    catch(err)
    {
        next(err);
    }
});

// Get Request Details — GET /request-api/request/:requestNumber
// Note: DONOR added so they can view details before accepting/completing
requestApp.get("/request/:requestNumber",verifyToken("DONOR","REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const requesterId=req.user.userId;
        const {requestNumber}=req.params;
        // find request (excluding deleted)
        const request=await BloodRequestModel.findOne({requestNumber,status:{$ne:"DELETED"}});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }
        // DONOR can view any request; REQUESTER/ADMIN must own it
        const isOwner=String(request.requestCreatedBy)===String(requesterId);
        if(req.user.role==="REQUESTER" && !isOwner && req.user.role!=="ADMIN")
        {
            return res.status(403).json({message:"You are not authorized to view this request"});
        }
        // send res
        res.status(200).json({message:"Request Details Fetched Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});

// Edit Blood Request — PUT /request-api/edit-request
requestApp.put("/edit-request",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const {
            requestNumber,patientName,patientAge,patientGender,bloodGroup,
            unitsRequired,hospitalName,hospitalAddress,state,contactPerson,
            contactNumber,alertLevel,requiredByDate
        }=req.body;
        // find request
        const request=await BloodRequestModel.findOne({requestNumber,status:{$ne:"DELETED"}});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }
        // check ownership
        if(String(request.requestCreatedBy)!==String(req.user.userId))
        {
            return res.status(403).json({message:"You are not authorized to edit this request"});
        }
        // only open requests can be edited
        if(request.status!=="OPEN")
        {
            return res.status(400).json({message:"Only OPEN requests can be edited"});
        }
        // update fields
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
        // notify requester
        await createNotification(req.user.userId,"Blood Request Updated",`Request ${requestNumber} has been updated`,"GENERAL");
        // send res
        res.status(200).json({message:"Blood Request Updated Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});

// Close Blood Request — PATCH /request-api/close-request
requestApp.patch("/close-request",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const {requestNumber}=req.body;
        // find request
        const request=await BloodRequestModel.findOne({requestNumber});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }
        // check ownership
        if(String(request.requestCreatedBy)!==String(req.user.userId))
        {
            return res.status(403).json({message:"You are not authorized to close this request"});
        }
        // check status
        if(request.status==="FULFILLED")
        {
            return res.status(400).json({message:"Fulfilled request cannot be closed"});
        }
        if(request.status==="CLOSED")
        {
            return res.status(400).json({message:"Request already closed"});
        }
        // close request
        request.status="CLOSED";
        await request.save();
        // notify requester
        await createNotification(req.user.userId,"Blood Request Closed",`Request ${requestNumber} has been closed`,"GENERAL");
        // send res
        res.status(200).json({message:"Blood Request Closed Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});

// Delete Blood Request (Soft Delete) — PATCH /request-api/delete-request
requestApp.patch("/delete-request",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const {requestNumber}=req.body;
        // find request
        const request=await BloodRequestModel.findOne({requestNumber});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }
        // check ownership
        if(String(request.requestCreatedBy)!==String(req.user.userId))
        {
            return res.status(403).json({message:"You are not authorized to delete this request"});
        }
        // check status
        if(request.status==="FULFILLED")
        {
            return res.status(400).json({message:"Fulfilled request cannot be deleted"});
        }
        if(request.status==="DELETED")
        {
            return res.status(400).json({message:"Request already deleted"});
        }
        // soft delete
        request.status="DELETED";
        await request.save();
        // notify requester
        await createNotification(req.user.userId,"Blood Request Deleted",`Request ${requestNumber} has been deleted`,"GENERAL");
        // send res
        res.status(200).json({message:"Blood Request Deleted Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});

// Requester Dashboard — GET /request-api/dashboard
requestApp.get("/dashboard",verifyToken("REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        // get all non-deleted requests by this requester
        const requests=await BloodRequestModel.find({
            requestCreatedBy:req.user.userId,
            status:{$ne:"DELETED"}
        });
        // calculate stats
        const totalRequests=requests.length;
        const openRequests=requests.filter((r)=>r.status==="OPEN").length;
        const fulfilledRequests=requests.filter((r)=>r.status==="FULFILLED").length;
        const totalUnitsRequired=requests.reduce((sum,request)=>sum+request.unitsRequired,0);
        const totalUnitsFulfilled=requests.reduce((sum,request)=>sum+request.unitsFulfilled,0);
        // send res
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

// Health Check — GET /request-api/
requestApp.get("/",(req,res)=>{
    res.json({message:"Request API Working"});
});
