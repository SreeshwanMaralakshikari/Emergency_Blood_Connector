import exp from "express";
import { config } from "dotenv";
import { connect } from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import { commonApp } from "./APIs/CommonAPI.js";
import { requestApp } from "./APIs/RequestAPI.js";
import { donorApp }
from "./APIs/DonorAPI.js";
import { notificationApp }from "./APIs/NotificationApi.js";

config();

//create express application
const app = exp();

//body parser middleware
app.use(exp.json());

//add cookie parser middleware
app.use(cookieParser());

//cors policy
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

app.use("/auth", commonApp);
app.use("/request-api", requestApp);
app.use("/donor-api", donorApp);
app.use("/notification-api",notificationApp);


//connect to db
const connectDB = async () => {
  try {
    await connect(process.env.DB_URL);

    console.log("DB Server connected");

    const port = process.env.PORT || 5000;

    app.listen(port, () => {
      console.log(`server listening on ${port}...`);
    });
  } catch (err) {
    console.log("err in db connect", err.message);
  }
};

connectDB();

//to handle invalid path
app.use((req, res) => {
  res.status(404).json({
    message: "Invalid Path",
  });
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: "Error Occurred",
    error: err.message,
  });
});