import exp from 'express'
import {NotificationModel} from '../models/NotificationModel.js'
import {verifyToken} from '../middlewares/verifyToken.js'

export const notificationApp=exp.Router();

// Get My Notifications — GET /notification-api/my-notifications
notificationApp.get("/my-notifications",verifyToken(),async(req,res,next)=>{
    try
    {
        // get all notifications for this user sorted by newest first
        const notifications=await NotificationModel.find({userId:req.user.userId}).sort({createdAt:-1});
        // send res
        res.status(200).json({message:"Notifications Fetched Successfully",payload:notifications});
    }
    catch(err)
    {
        next(err);
    }
});

// Get Unread Count — GET /notification-api/unread-count
notificationApp.get("/unread-count",verifyToken(),async(req,res,next)=>{
    try
    {
        // count unread notifications for this user
        const count=await NotificationModel.countDocuments({userId:req.user.userId,isRead:false});
        // send res
        res.status(200).json({unreadCount:count});
    }
    catch(err)
    {
        next(err);
    }
});

// Mark Notification As Read — PUT /notification-api/mark-read/:id
notificationApp.put("/mark-read/:id",verifyToken(),async(req,res,next)=>{
    try
    {
        // find and update notification (scoped to this user for security)
        const notification=await NotificationModel.findOneAndUpdate(
            {_id:req.params.id,userId:req.user.userId},
            {isRead:true},
            {new:true}
        );
        if(!notification)
        {
            return res.status(404).json({message:"Notification Not Found"});
        }
        // send res
        res.status(200).json({message:"Notification Marked As Read",payload:notification});
    }
    catch(err)
    {
        next(err);
    }
});

// Health Check — GET /notification-api/
notificationApp.get("/",(req,res)=>{
    res.json({message:"Notification API Working"});
});
