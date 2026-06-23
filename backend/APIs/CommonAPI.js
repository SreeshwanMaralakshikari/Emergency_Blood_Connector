import exp from 'express'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {UserModel} from '../models/UserModel.js'
import {verifyToken} from '../middlewares/verifyToken.js'
import {upload} from '../config/multer.js'
import {uploadToCloudinary} from '../config/cloudinaryUpload.js'
import cloudinary from '../config/cloudinary.js'

export const commonApp=exp.Router();


// REGISTER
commonApp.post("/register",upload.single("profileImageUrl"),async(req,res,next)=>{
    //track cloudinary upload so we can roll it back if db save fails
    let cloudinaryResult=null;
    try
    {
        //destructure only known fields to avoid strict:throw errors
        const {firstName,lastName,email,password,phoneNumber,bloodGroup,state,role}=req.body;

        //only DONOR and REQUESTER can self-register
        const allowedRoles=["DONOR","REQUESTER"];
        if(!allowedRoles.includes(role))
        {
            return res.status(400).json({message:"Invalid Role"});
        }

        //validate password
        if(!password || password.trim().length===0)
        {
            return res.status(400).json({message:"Password cannot be empty"});
        }

        //check for existing user
        const existingUser=await UserModel.findOne({email});
        if(existingUser)
        {
            return res.status(409).json({message:"User already exists"});
        }

        //upload profile image to cloudinary if provided
        if(req.file)
        {
            cloudinaryResult=await uploadToCloudinary(req.file.buffer);
        }

        //hash password and create user
        const hashedPassword=await bcryptjs.hash(password,10);
        //only include profileImageUrl when an image was actually uploaded
        const createData={
            firstName,lastName,email,password:hashedPassword,
            phoneNumber,bloodGroup,state,role
        };
        if(cloudinaryResult?.secure_url)
        {
            createData.profileImageUrl=cloudinaryResult.secure_url;
        }
        const createdUser=await UserModel.create(createData);

        const userObj=createdUser.toObject();
        delete userObj.password;

        //send res
        res.status(201).json({message:"User created successfully",payload:userObj});
    }
    catch(err)
    {
        //log the real error so it appears in Render logs
        console.error("REGISTER ERROR:",err?.name,err?.message);
        //if db save failed after image was uploaded, attempt to delete it from cloudinary
        //wrap in try/catch so a cloudinary failure does not mask the original error
        if(cloudinaryResult?.public_id)
        {
            try
            {
                await cloudinary.uploader.destroy(cloudinaryResult.public_id);
            }
            catch(cloudinaryErr)
            {
                console.error("cloudinary cleanup failed",cloudinaryErr.message);
            }
        }
        next(err);
    }
});


// LOGIN
commonApp.post("/login",async(req,res,next)=>{
    try
    {
        const userCred=req.body;

        //find user by email
        const dbUser=await UserModel.findOne({email:userCred.email});
        if(!dbUser)
        {
            return res.status(401).json({message:"Invalid Email"});
        }

        //check password
        const passwordMatched=await bcryptjs.compare(userCred.password,dbUser.password);
        if(!passwordMatched)
        {
            return res.status(401).json({message:"Invalid Password"});
        }

        //check if user is active
        if(!dbUser.isUserActive)
        {
            return res.status(400).json({message:"User has been deactivated"});
        }

        //update login history (keep last 50 entries)
        dbUser.lastLogin=new Date();
        dbUser.loginHistory.push(new Date());
        if(dbUser.loginHistory.length>50)
        {
            dbUser.loginHistory.shift();
        }
        await dbUser.save();

        //sign JWT token
        const signedToken=jwt.sign(
            {userId:dbUser._id,email:dbUser.email,role:dbUser.role},
            process.env.SECRET_KEY,
            {expiresIn:"7d"}
        );

        //token sent in response body, stored in localStorage by frontend
        const userObj=dbUser.toObject();
        delete userObj.password;

        //send res
        res.status(200).json({message:"Login Successful",token:signedToken,payload:userObj});
    }
    catch(err)
    {
        next(err);
    }
});


// CHECK AUTH
commonApp.get("/check-auth",verifyToken("DONOR","REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const dbUser=await UserModel.findById(req.user.userId).select("-password");
        if(!dbUser)
        {
            return res.status(404).json({message:"User Not Found"});
        }

        //send res
        res.status(200).json({message:"Authenticated",payload:dbUser});
    }
    catch(err)
    {
        next(err);
    }
});


// LOGOUT
commonApp.get("/logout",(req,res)=>{
    //token is removed from localStorage by frontend
    res.status(200).json({message:"Logout Successful"});
});




// UPDATE PROFILE
commonApp.patch("/update-profile",upload.single("profileImageUrl"),verifyToken("DONOR","REQUESTER","ADMIN"),async(req,res,next)=>{
    let cloudinaryResult=null;
    try
    {
        const userId=req.user.userId;
        const {firstName,lastName,phoneNumber,state}=req.body;

        //get user from db
        const user=await UserModel.findById(userId);
        if(!user)
        {
            return res.status(404).json({message:"User Not Found"});
        }

        //upload new profile image if provided
        if(req.file)
        {
            cloudinaryResult=await uploadToCloudinary(req.file.buffer);
            //delete old image from cloudinary if one existed
            if(user.profileImageUrl)
            {
                //extract public_id from the existing URL
                const urlParts=user.profileImageUrl.split("/");
                const filenameWithExt=urlParts[urlParts.length-1];
                const folder=urlParts[urlParts.length-2];
                const publicId=`${folder}/${filenameWithExt.split(".")[0]}`;
                try
                {
                    await cloudinary.uploader.destroy(publicId);
                }
                catch(err)
                {
                    console.error("old image cleanup failed",err.message);
                }
            }
        }

        //update only provided fields
        if(firstName)  user.firstName=firstName;
        if(lastName)   user.lastName=lastName;
        if(phoneNumber) user.phoneNumber=phoneNumber;
        if(state)      user.state=state;
        if(cloudinaryResult?.secure_url) user.profileImageUrl=cloudinaryResult.secure_url;

        await user.save();

        const userObj=user.toObject();
        delete userObj.password;

        //send res
        res.status(200).json({message:"Profile updated successfully",payload:userObj});
    }
    catch(err)
    {
        //if db save failed after image upload, attempt rollback
        if(cloudinaryResult?.public_id)
        {
            try
            {
                await cloudinary.uploader.destroy(cloudinaryResult.public_id);
            }
            catch(cloudinaryErr)
            {
                console.error("cloudinary cleanup failed",cloudinaryErr.message);
            }
        }
        next(err);
    }
});


// CHANGE PASSWORD
commonApp.patch("/change-password",verifyToken("DONOR","REQUESTER","ADMIN"),async(req,res,next)=>{
    try
    {
        const userId=req.user.userId;
        const {currentPassword,newPassword}=req.body;

        if(!currentPassword || !newPassword)
        {
            return res.status(400).json({message:"Current password and new password are required"});
        }
        if(newPassword.trim().length<6)
        {
            return res.status(400).json({message:"New password must be at least 6 characters"});
        }

        //get user from db
        const user=await UserModel.findById(userId);
        if(!user)
        {
            return res.status(404).json({message:"User Not Found"});
        }

        //verify current password
        const passwordMatched=await bcryptjs.compare(currentPassword,user.password);
        if(!passwordMatched)
        {
            return res.status(401).json({message:"Current password is incorrect"});
        }

        //hash and save new password
        user.password=await bcryptjs.hash(newPassword,10);
        await user.save();

        //send res
        res.status(200).json({message:"Password changed successfully"});
    }
    catch(err)
    {
        next(err);
    }
});


// HEALTH CHECK
commonApp.get("/",(req,res)=>{
    res.json({message:"Common API Working"});
});
