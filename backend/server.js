import exp from 'express'
import {config} from 'dotenv'
import {connect} from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import {commonApp} from './APIs/CommonAPI.js'
import {requestApp} from './APIs/RequestAPI.js'
import {donorApp} from './APIs/DonorAPI.js'
import {notificationApp} from './APIs/NotificationAPI.js'
import {adminApp} from './APIs/AdminAPI.js'

// load environment variables
config();

// create express application
const app=exp();

// ── Middleware ──────────────────────────────────────────
app.use(exp.json());
app.use(cookieParser());
app.use(cors({
    origin:[process.env.FRONTEND_URL,"http://localhost:5173"],
    credentials:true,
}));

// ── Routes ─────────────────────────────────────────────
app.use("/auth",commonApp);
app.use("/request-api",requestApp);
app.use("/donor-api",donorApp);
app.use("/notification-api",notificationApp);
app.use("/admin-api",adminApp);

// ── Database + Server Start ─────────────────────────────
const connectDB=async()=>{
    try
    {
        await connect(process.env.DB_URL);
        console.log("DB Server connected");
        const port=process.env.PORT || 5000;
        app.listen(port,()=>console.log(`server listening on ${port}...`));
    }
    catch(err)
    {
        console.log("err in db connect",err.message);
    }
};

connectDB();

// ── 404 Handler ────────────────────────────────────────
app.use((req,res,next)=>{
    res.status(404).json({message:`Path ${req.url} is Invalid`});
});

// ── Global Error Handler ────────────────────────────────
app.use((err,req,res,next)=>{
    // validation error
    if(err.name==="ValidationError")
    {
        return res.status(400).json({message:"error occurred",error:err.message});
    }
    // cast error
    if(err.name==="CastError")
    {
        return res.status(400).json({message:"error occurred",error:err.message});
    }
    // duplicate key error
    const errCode=err.code ?? err.cause?.code ?? err.errorResponse?.code;
    const keyValue=err.keyValue ?? err.cause?.keyValue ?? err.errorResponse?.keyValue;
    if(errCode===11000)
    {
        if(keyValue)
        {
            const field=Object.keys(keyValue)[0];
            const value=keyValue[field];
            return res.status(409).json({message:"error occurred",error:`${field} "${value}" already exists`});
        }
        return res.status(409).json({message:"error occurred",error:"Duplicate key error"});
    }
    // server side error
    res.status(500).json({message:"error occurred",error:"Server side error"});
});
