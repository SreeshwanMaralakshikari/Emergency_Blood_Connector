import {Schema,model} from 'mongoose'

//Create Donation Schema
const donationSchema=new Schema({
    donorId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:[true,"Donor ID is required"]
    },
    bloodRequestId:{
        type:Schema.Types.ObjectId,
        ref:"bloodrequest",
        required:[true,"Blood Request ID is required"]
    },
    requestNumber:{
        type:String,
        required:[true,"Request Number is required"]
    },
    alertLevel:{
        type:String,
        required:[true,"Alert Level is required"],
        enum:["GREEN","YELLOW","RED","BLACK"]
    },
    pointsAwarded:{
        type:Number,
        required:true,
        default:0
    },
    unitsDonated:{
        type:Number,
        default:1,
        min:1
    },
    donationDate:{
        type:Date,
        default:Date.now
    },
    nextEligibleDonationDate:{
        type:Date,
        required:[true,"Next Eligible Date is required"]
    },
    status:{
        type:String,
        enum:["PENDING","CONFIRMED","REJECTED"],
        default:"PENDING"
    },
    isVerified:{
        type:Boolean,
        default:false
    }
},
{
    timestamps:true,
    versionKey:false,
    strict:"throw"
});

//index for donor history queries
donationSchema.index({donorId:1,createdAt:-1});

//Create Donation Model
export const DonationModel=model("donation",donationSchema);
