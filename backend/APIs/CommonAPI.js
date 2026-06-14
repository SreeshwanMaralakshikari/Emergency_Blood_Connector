import exp from 'express'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {UserModel} from '../models/UserModel.js'
import {verifyToken} from '../middlewares/verifyToken.js'

export const commonApp=exp.Router();

// Register — POST /auth/register
commonApp.post("/register",async(req,res,next)=>{
    try
    {
        // destructure only known fields to avoid strict:throw errors
        const {firstName,lastName,email,password,phoneNumber,bloodGroup,state,role,profileImageUrl}=req.body;
        // only DONOR and REQUESTER can self-register; ADMIN is created manually
        const allowedRoles=["DONOR","REQUESTER"];
        if(!allowedRoles.includes(role))
        {
            return res.status(400).json({message:"Invalid Role"});
        }
        // validate password
        if(!password || password.trim().length===0)
        {
            return res.status(400).json({message:"Password cannot be empty"});
        }
        // check for existing user
        const existingUser=await UserModel.findOne({email});
        if(existingUser)
        {
            return res.status(409).json({message:"User already exists"});
        }
        // hash password and create user
        const hashedPassword=await bcryptjs.hash(password,10);
        const createdUser=await UserModel.create({
            firstName,lastName,email,password:hashedPassword,
            phoneNumber,bloodGroup,state,role,profileImageUrl
        });
        const userObj=createdUser.toObject();
        delete userObj.password;
        // send res
        res.status(201).json({message:"User created successfully",payload:userObj});
    }
    catch(err)
    {
        next(err);
    }
});

// Login — POST /auth/login
commonApp.post("/login",async(req,res,next)=>{
    try
    {
        const userCred=req.body;
        // find user by email
        const dbUser=await UserModel.findOne({email:userCred.email});
        if(!dbUser)
        {
            return res.status(401).json({message:"Invalid Email"});
        }
        // check password
        const passwordMatched=await bcryptjs.compare(userCred.password,dbUser.password);
        if(!passwordMatched)
        {
            return res.status(401).json({message:"Invalid Password"});
        }
        // check if user is active
        if(!dbUser.isUserActive)
        {
            return res.status(400).json({message:"User has been deactivated"});
        }
        // update login history (keep last 50 entries)
        dbUser.lastLogin=new Date();
        dbUser.loginHistory.push(new Date());
        if(dbUser.loginHistory.length>50)
        {
            dbUser.loginHistory.shift();
        }
        await dbUser.save();
        // sign JWT token
        const signedToken=jwt.sign(
            {userId:dbUser._id,email:dbUser.email,role:dbUser.role},
            process.env.SECRET_KEY,
            {expiresIn:"7d"}
        );
        // set HTTP-only cookie
        res.cookie("token",signedToken,{
            httpOnly:true,
            sameSite:"lax",
            maxAge:7*24*60*60*1000 // 7 days
        });
        const userObj=dbUser.toObject();
        delete userObj.password;
        // send res
        res.status(200).json({message:"Login Successful",token:signedToken,payload:userObj});
    }
    catch(err)
    {
        next(err);
    }
});

// Check Auth (session restore on page refresh) — GET /auth/check-auth
commonApp.get("/check-auth",verifyToken("DONOR","REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const dbUser=await UserModel.findById(req.user.userId).select("-password");
        if(!dbUser)
        {
            return res.status(404).json({message:"User Not Found"});
        }
        // send res
        res.status(200).json({message:"Authenticated",payload:dbUser});
    }
    catch(err)
    {
        next(err);
    }
});

// Logout — GET /auth/logout
commonApp.get("/logout",(req,res)=>{
    res.clearCookie("token");
    res.status(200).json({message:"Logout Successful"});
});

// Health Check — GET /auth/
commonApp.get("/",(req,res)=>{
    res.json({message:"Common API Working"});
});
