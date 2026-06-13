import exp from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/UserModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const commonApp = exp.Router();


// REGISTER
commonApp.post(
  "/register",
  async (req, res, next) => {
    try {
      const newUser = req.body;

      const allowedRoles = [
        "DONOR",
        "REQUESTER",
      ];

      if (
        !allowedRoles.includes(
          newUser.role
        )
      ) {
        return res.status(400).json({
          message: "Invalid Role",
        });
      }

      if (
        !newUser.password ||
        newUser.password.trim().length === 0
      ) {
        return res.status(400).json({
          message:
            "Password cannot be empty",
        });
      }

      const existingUser =
        await UserModel.findOne({
          email: newUser.email,
        });

      if (existingUser) {
        return res.status(409).json({
          message:
            "User already exists",
        });
      }

      const hashedPassword =
        await bcryptjs.hash(
          newUser.password,
          10
        );

      newUser.password =
        hashedPassword;

      const createdUser =
        await UserModel.create(
          newUser
        );

      const userObj =
        createdUser.toObject();

      delete userObj.password;

      res.status(201).json({
        message:
          "User created successfully",
        payload: userObj,
      });
    } catch (err) {
      next(err);
    }
  }
);


// LOGIN
commonApp.post(
  "/login",
  async (req, res, next) => {
    try {
      const userCred = req.body;

      const dbUser =
        await UserModel.findOne({
          email:
            userCred.email,
        });

      if (!dbUser) {
        return res.status(401).json({
          message:
            "Invalid Email",
        });
      }

      const passwordMatched =
        await bcryptjs.compare(
          userCred.password,
          dbUser.password
        );

      if (!passwordMatched) {
        return res.status(401).json({
          message:
            "Invalid Password",
        });
      }

      if (!dbUser.isUserActive) {
        return res.status(400).json({
          message:
            "User has been deactivated",
        });
      }

      dbUser.lastLogin =
        new Date();

      dbUser.loginHistory.push(
        new Date()
      );

      if (
        dbUser.loginHistory.length >
        50
      ) {
        dbUser.loginHistory.shift();
      }

      await dbUser.save();

      const signedToken =
        jwt.sign(
          {
            userId:
              dbUser._id,
            email:
              dbUser.email,
            role:
              dbUser.role,
          },
          process.env.SECRET_KEY,
          {
            expiresIn: "7d",
          }
        );

      res.cookie(
        "token",
        signedToken,
        {
          httpOnly: true,
          sameSite: "lax",
          maxAge:
            7 *
            24 *
            60 *
            60 *
            1000,
        }
      );

      const userObj =
        dbUser.toObject();

      delete userObj.password;

      res.status(200).json({
        message:
          "Login Successful",

        token:
          signedToken,

        payload:
          userObj,
      });
    } catch (err) {
      next(err);
    }
  }
);


// CHECK AUTH
commonApp.get(
  "/check-auth",
  verifyToken(
    "DONOR",
    "REQUESTER",
    "ADMIN"
  ),
  async (req, res, next) => {
    try {
      const dbUser =
        await UserModel.findById(
          req.user.userId
        ).select("-password");

      if (!dbUser) {
        return res.status(404).json({
          message:
            "User Not Found",
        });
      }

      res.status(200).json({
        message:
          "Authenticated",
        payload:
          dbUser,
      });
    } catch (err) {
      next(err);
    }
  }
);


// LOGOUT
commonApp.get(
  "/logout",
  (req, res) => {
    res.clearCookie(
      "token"
    );

    res.status(200).json({
      message:
        "Logout Successful",
    });
  }
);


// HEALTH CHECK
commonApp.get(
  "/",
  (req, res) => {
    res.json({
      message:
        "Common API Working",
    });
  }
);

export { commonApp };