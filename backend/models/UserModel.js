import {Schema,model} from 'mongoose'

//Create User Schema
const userSchema=new Schema({
    firstName:{
        type:String,
        required:[true,"First Name is required"],
        trim:true
    },
    lastName:{
        type:String,
        required:[true,"Last Name is required"],
        trim:true
    },
    email:{
        type:String,
        required:[true,"Email is required"],
        unique:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    phoneNumber:{
        type:String,
        required:[true,"Phone Number is required"],
        unique:true
    },
    bloodGroup:{
        type:String,
        required:[true,"Blood Group is required"],
        enum:["O+","O-","A+","A-","B+","B-","AB+","AB-"]
    },
    state:{
        type:String,
        required:[true,"State is required"]
    },
    role:{
        type:String,
        enum:["DONOR","REQUESTER","ADMIN"],
        default:"DONOR"
    },
    isAvailable:{
        type:Boolean,
        default:true
    },
    profileImageUrl:{
        type:String,
        default:""
    },
    donationsCount:{
        type:Number,
        default:0
    },
    totalPoints:{
        type:Number,
        default:0
    },
    donorLevel:{
        type:String,
        enum:["Iron","Bronze","Silver","Gold","Platinum","Diamond"],
        default:"Iron"
    },
    badges:{
        type:[String],
        default:[]
    },
    lastDonationDate:{
        type:Date,
        default:null
    },
    nextEligibleDonationDate:{
        type:Date,
        default:null
    },
    isUserActive:{
        type:Boolean,
        default:true
    },
    loginHistory:{
        type:[Date],
        default:[]
    },
    lastLogin:{
        type:Date,
        default:null
    },
    availabilityUpdatedAt:{
        type:Date,
        default:null
    }
},
{
    timestamps:true,
    versionKey:false,
    strict:"throw"
});

//index for donor search queries
userSchema.index({role:1,isAvailable:1,state:1,bloodGroup:1});

//Create User Model
export const UserModel=model("user",userSchema);
