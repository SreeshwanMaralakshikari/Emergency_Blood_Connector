import exp from 'express'
import {verifyToken} from '../middlewares/verifyToken.js'
import {UserModel} from '../models/UserModel.js'
import {BloodRequestModel} from '../models/BloodRequestModel.js'
import {DonationModel} from '../models/DonationModel.js'

export const adminApp=exp.Router();


// GET ALL USERS
adminApp.get("/users",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        //read all users
        const users=await UserModel.find().select("-password").sort({createdAt:-1});

        //send res
        res.status(200).json({message:"Users Fetched Successfully",payload:users});
    }
    catch(err)
    {
        next(err);
    }
});


// GET ALL DONORS
adminApp.get("/donors",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        //read all donors
        const donors=await UserModel.find({role:"DONOR"}).select("-password").sort({createdAt:-1});

        //send res
        res.status(200).json({message:"Donors Fetched Successfully",payload:donors});
    }
    catch(err)
    {
        next(err);
    }
});


// GET ALL REQUESTERS
adminApp.get("/requesters",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        //read all requesters
        const requesters=await UserModel.find({role:"REQUESTER"}).select("-password").sort({createdAt:-1});

        //send res
        res.status(200).json({message:"Requesters Fetched Successfully",payload:requesters});
    }
    catch(err)
    {
        next(err);
    }
});


// GET USER DETAILS
adminApp.post("/user-details",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        const {userId}=req.body;
        if(!userId)
        {
            return res.status(400).json({message:"userId is required"});
        }

        //get user by id
        const user=await UserModel.findById(userId).select("-password");
        if(!user)
        {
            return res.status(404).json({message:"User Not Found"});
        }

        //send res
        res.status(200).json({message:"User Fetched Successfully",payload:user});
    }
    catch(err)
    {
        next(err);
    }
});


// ACTIVATE / DEACTIVATE USER
adminApp.patch("/user-status",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        const {userId,isUserActive}=req.body;
        if(!userId)
        {
            return res.status(400).json({message:"userId is required"});
        }
        if(typeof isUserActive!=="boolean")
        {
            return res.status(400).json({message:"isUserActive must be true or false"});
        }

        //prevent admin from deactivating their own account
        if(String(userId)===String(req.user.userId))
        {
            return res.status(400).json({message:"You cannot change your own account status"});
        }

        //get user by id
        const user=await UserModel.findById(userId);
        if(!user)
        {
            return res.status(404).json({message:"User Not Found"});
        }

        //update status
        user.isUserActive=isUserActive;
        await user.save();

        const userObj=user.toObject();
        delete userObj.password;

        //send res
        res.status(200).json({message:"User Status Updated Successfully",payload:userObj});
    }
    catch(err)
    {
        next(err);
    }
});


// GET ALL REQUESTS
adminApp.get("/requests",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        //read all requests
        const requests=await BloodRequestModel.find().sort({createdAt:-1});

        //send res
        res.status(200).json({message:"Requests Fetched Successfully",payload:requests});
    }
    catch(err)
    {
        next(err);
    }
});


// GET OPEN REQUESTS
adminApp.get("/open-requests",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        //read open requests sorted by priority
        const requests=await BloodRequestModel.find({status:"OPEN"}).sort({priorityScore:-1,createdAt:-1});

        //send res
        res.status(200).json({message:"Open Requests Fetched Successfully",payload:requests});
    }
    catch(err)
    {
        next(err);
    }
});


// GET FULFILLED REQUESTS
adminApp.get("/fulfilled-requests",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        //read fulfilled requests
        const requests=await BloodRequestModel.find({status:"FULFILLED"}).sort({updatedAt:-1});

        //send res
        res.status(200).json({message:"Fulfilled Requests Fetched Successfully",payload:requests});
    }
    catch(err)
    {
        next(err);
    }
});


// GET DELETED REQUESTS
adminApp.get("/deleted-requests",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        //read deleted requests
        const requests=await BloodRequestModel.find({status:"DELETED"}).sort({updatedAt:-1});

        //send res
        res.status(200).json({message:"Deleted Requests Fetched Successfully",payload:requests});
    }
    catch(err)
    {
        next(err);
    }
});


// GET REQUEST DETAILS
adminApp.post("/request-details",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        const {requestNumber}=req.body;
        if(!requestNumber)
        {
            return res.status(400).json({message:"requestNumber is required"});
        }

        //get request by number
        const request=await BloodRequestModel.findOne({requestNumber});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }

        //send res
        res.status(200).json({message:"Request Fetched Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});


// FORCE CLOSE REQUEST
adminApp.patch("/force-close-request",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        const {requestNumber}=req.body;

        //find request
        const request=await BloodRequestModel.findOne({requestNumber});
        if(!request)
        {
            return res.status(404).json({message:"Blood Request Not Found"});
        }

        //check status
        if(request.status==="DELETED")
        {
            return res.status(400).json({message:"Deleted request cannot be closed"});
        }
        if(request.status==="CLOSED")
        {
            return res.status(400).json({message:"Request already closed"});
        }
        if(request.status==="FULFILLED")
        {
            return res.status(400).json({message:"Fulfilled request cannot be force closed"});
        }

        //force close
        request.status="CLOSED";
        await request.save();

        //send res
        res.status(200).json({message:"Request Force Closed Successfully",payload:request});
    }
    catch(err)
    {
        next(err);
    }
});


// ADMIN DASHBOARD
adminApp.get("/dashboard",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        //get user counts
        const totalUsers=await UserModel.countDocuments();
        const totalDonors=await UserModel.countDocuments({role:"DONOR"});
        const totalRequesters=await UserModel.countDocuments({role:"REQUESTER"});
        const availableDonors=await UserModel.countDocuments({role:"DONOR",isAvailable:true});
        const unavailableDonors=await UserModel.countDocuments({role:"DONOR",isAvailable:false});

        //get request counts (excluding deleted from total)
        const totalRequests=await BloodRequestModel.countDocuments({status:{$ne:"DELETED"}});
        const openRequests=await BloodRequestModel.countDocuments({status:"OPEN"});
        const fulfilledRequests=await BloodRequestModel.countDocuments({status:"FULFILLED"});
        const closedRequests=await BloodRequestModel.countDocuments({status:"CLOSED"});
        const deletedRequests=await BloodRequestModel.countDocuments({status:"DELETED"});

        //get total donation count
        const totalDonations=await DonationModel.countDocuments();

        //send res
        res.status(200).json({
            message:"Admin Dashboard",
            payload:{
                totalUsers,totalDonors,totalRequesters,
                availableDonors,unavailableDonors,
                totalRequests,openRequests,fulfilledRequests,closedRequests,deletedRequests,
                totalDonations
            }
        });
    }
    catch(err)
    {
        next(err);
    }
});


// ADMIN STATISTICS
adminApp.get("/statistics",verifyToken("ADMIN"),async(req,res,next)=>{
    try
    {
        //blood group distribution across all users
        const bloodGroupStats=await UserModel.aggregate([
            {$group:{_id:"$bloodGroup",count:{$sum:1}}},
            {$sort:{_id:1}}
        ]);

        //state-wise user distribution
        const stateStats=await UserModel.aggregate([
            {$group:{_id:"$state",count:{$sum:1}}},
            {$sort:{count:-1}}
        ]);

        //alert level distribution across non-deleted requests
        const alertLevelStats=await BloodRequestModel.aggregate([
            {$match:{status:{$ne:"DELETED"}}},
            {$group:{_id:"$alertLevel",count:{$sum:1}}}
        ]);

        //request status distribution
        const requestStatusStats=await BloodRequestModel.aggregate([
            {$group:{_id:"$status",count:{$sum:1}}}
        ]);

        //send res
        res.status(200).json({
            message:"Admin Statistics",
            payload:{bloodGroupStats,stateStats,alertLevelStats,requestStatusStats}
        });
    }
    catch(err)
    {
        next(err);
    }
});


// HEALTH CHECK
adminApp.get("/",(req,res)=>{
    res.json({message:"Admin API Working"});
});
