import {NotificationModel} from '../models/NotificationModel.js'

//create and save a notification for a user
export const createNotification=async(userId,title,message,type="GENERAL")=>{
    await NotificationModel.create({userId,title,message,type});
};
