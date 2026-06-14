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
        const {firstName,lastName,email,password,phoneNumber,bloodGroup,state,role,profileImageUrl}=req.body;
        const allowedRoles=["DONOR","REQUESTER"];
        if(!allowedRoles.includes(role))
        {
            return res.status(400).json({message:"Invalid Role"});
        }
        if(!password || password.trim().length===0)
        {
            return res.status(400).json({message:"Password cannot be empty"});
        }
        const existingUser=await UserModel.findOne({email});
        if(existingUser)
        {
            return res.status(409).json({message:"User already exists"});
        }
        const hashedPassword=await bcryptjs.hash(password,10);
        const createdUser=await UserModel.create({
            firstName,lastName,email,password:hashedPassword,
            phoneNumber,bloodGroup,state,role,profileImageUrl
        });
        const userObj=createdUser.toObject();
        delete userObj.password;
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
        const dbUser=await UserModel.findOne({email:userCred.email});
        if(!dbUser)
        {
            return res.status(401).json({message:"Invalid Email"});
        }
        const passwordMatched=await bcryptjs.compare(userCred.password,dbUser.password);
        if(!passwordMatched)
        {
            return res.status(401).json({message:"Invalid Password"});
        }
        if(!dbUser.isUserActive)
        {
            return res.status(400).json({message:"User has been deactivated"});
        }
        dbUser.lastLogin=new Date();
        dbUser.loginHistory.push(new Date());
        if(dbUser.loginHistory.length>50)
        {
            dbUser.loginHistory.shift();
        }
        await dbUser.save();
        const signedToken=jwt.sign(
            {userId:dbUser._id,email:dbUser.email,role:dbUser.role},
            process.env.SECRET_KEY,
            {expiresIn:"7d"}
        );
        // no cookie — token sent in response body, stored in localStorage by frontend
        const userObj=dbUser.toObject();
        delete userObj.password;
        res.status(200).json({message:"Login Successful",token:signedToken,payload:userObj});
    }
    catch(err)
    {
        next(err);
    }
});

// Check Auth — GET /auth/check-auth
commonApp.get("/check-auth",verifyToken("DONOR","REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const dbUser=await UserModel.findById(req.user.userId).select("-password");
        if(!dbUser)
        {
            return res.status(404).json({message:"User Not Found"});
        }
        res.status(200).json({message:"Authenticated",payload:dbUser});
    }
    catch(err)
    {
        next(err);
    }
});

// Logout — GET /auth/logout
// token is removed from localStorage by frontend — nothing to do on backend
commonApp.get("/logout",(req,res)=>{
    res.status(200).json({message:"Logout Successful"});
});

// Health Check — GET /auth/
commonApp.get("/",(req,res)=>{
    res.json({message:"Common API Working"});
});