import {Schema,model} from 'mongoose'

//Create Notification Schema
const notificationSchema=new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:[true,"User ID is required"]
    },
    title:{
        type:String,
        required:[true,"Title is required"]
    },
    message:{
        type:String,
        required:[true,"Message is required"]
    },
    type:{
        type:String,
        enum:["REQUEST_CREATED","REQUEST_ACCEPTED","DONATION_COMPLETED","DONATION_CONFIRMED","BADGE_EARNED","GENERAL"],
        default:"GENERAL"
    },
    isRead:{
        type:Boolean,
        default:false
    }
},
{
    timestamps:true,
    versionKey:false,
    strict:"throw"
});

//Create Notification Model
export const NotificationModel=model("notification",notificationSchema);
