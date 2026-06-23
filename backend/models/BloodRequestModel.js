import {Schema,model} from 'mongoose'

//Create Blood Request Schema
const bloodRequestSchema=new Schema({
    requestNumber:{
        type:String,
        unique:true,
        required:[true,"Request Number is required"]
    },
    patientName:{
        type:String,
        required:[true,"Patient Name is required"],
        trim:true
    },
    patientAge:{
        type:Number,
        required:[true,"Patient Age is required"],
        min:0,
        max:120
    },
    patientGender:{
        type:String,
        required:[true,"Patient Gender is required"],
        enum:["MALE","FEMALE","OTHER"]
    },
    bloodGroup:{
        type:String,
        required:[true,"Blood Group is required"],
        enum:["O+","O-","A+","A-","B+","B-","AB+","AB-"]
    },
    unitsRequired:{
        type:Number,
        required:[true,"Units Required is required"],
        min:1,
        max:20
    },
    unitsFulfilled:{
        type:Number,
        default:0
    },
    hospitalName:{
        type:String,
        required:[true,"Hospital Name is required"],
        trim:true
    },
    hospitalAddress:{
        type:String,
        required:[true,"Hospital Address is required"],
        trim:true
    },
    state:{
        type:String,
        required:[true,"State is required"]
    },
    contactPerson:{
        type:String,
        required:[true,"Contact Person is required"],
        trim:true
    },
    contactNumber:{
        type:String,
        required:[true,"Contact Number is required"]
    },
    requestCreatedBy:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:[true,"Request Creator is required"]
    },
    alertLevel:{
        type:String,
        required:[true,"Alert Level is required"],
        enum:["GREEN","YELLOW","RED","BLACK"]
    },
    status:{
        type:String,
        enum:["OPEN","FULFILLED","CLOSED","EXPIRED","DELETED"],
        default:"OPEN"
    },
    acceptedDonors:[{
        _id:false,
        donorId:{
            type:Schema.Types.ObjectId,
            ref:"user",
            required:true
        },
        acceptedAt:{
            type:Date,
            default:Date.now
        }
    }],
    //donors who have donated and are awaiting requester confirmation
    pendingConfirmation:[{
        _id:false,
        donorId:{
            type:Schema.Types.ObjectId,
            ref:"user",
            required:true
        },
        donationId:{
            type:Schema.Types.ObjectId,
            ref:"donation",
            required:true
        },
        donatedAt:{
            type:Date,
            default:Date.now
        }
    }],
    completedDonors:[{
        type:Schema.Types.ObjectId,
        ref:"user"
    }],
    priorityScore:{
        type:Number,
        default:0
    },
    isHospitalVerified:{
        type:Boolean,
        default:false
    },
    requiredByDate:{
        type:Date,
        required:[true,"Required By Date is required"]
    },
    expiresAt:{
        type:Date,
        required:[true,"Expiry Date is required"]
    }
},
{
    timestamps:true,
    versionKey:false,
    strict:"throw"
});

//index for open request queries sorted by priority
bloodRequestSchema.index({status:1,priorityScore:-1});

//Create Blood Request Model
export const BloodRequestModel=model("bloodrequest",bloodRequestSchema);
