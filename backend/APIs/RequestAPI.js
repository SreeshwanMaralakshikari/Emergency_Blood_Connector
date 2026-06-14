import exp from "express";
import { createNotification }from "../utils/createNotification.js";
import { BloodRequestModel } from "../models/BloodRequestModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { calculateExpiryDate } from "../utils/requestExpiry.js";
import { calculatePriorityScore } from "../utils/calculatePriorityScore.js";
import { generateRequestNumber } from "../utils/generateRequestNumber.js";

const requestApp = exp.Router();


// CREATE BLOOD REQUEST
requestApp.post(
  "/create-request",
  verifyToken(
    "REQUESTER",
    "ADMIN"
  ),
  async (req, res, next) => {
    try {
      const requestData = req.body;

      const requestCount =
        await BloodRequestModel.countDocuments();

      const requestNumber =
        generateRequestNumber(
          requestCount
        );

      const bloodRequestData = {
        requestNumber,

        patientName:
          requestData.patientName,

        patientAge:
          requestData.patientAge,

        patientGender:
          requestData.patientGender,

        bloodGroup:
          requestData.bloodGroup,

        unitsRequired:
          requestData.unitsRequired,

        hospitalName:
          requestData.hospitalName,

        hospitalAddress:
          requestData.hospitalAddress,

        state:
          requestData.state,

        contactPerson:
          requestData.contactPerson,

        contactNumber:
          requestData.contactNumber,

        alertLevel:
          requestData.alertLevel,

        requiredByDate:
          requestData.requiredByDate,

        requestCreatedBy:
          req.user.userId,

        status: "OPEN",

        priorityScore:
          calculatePriorityScore(
            requestData.alertLevel,
            requestData.unitsRequired
          ),

        expiresAt:
          calculateExpiryDate(
            requestData.alertLevel
          ),

        unitsFulfilled: 0,

        acceptedDonors: [],

        completedDonors: [],

        isHospitalVerified: false,
      };

      const createdRequest =
        await BloodRequestModel.create(
          bloodRequestData
        );

        await createNotification(
          req.user.userId,
          "Blood Request Created",
          `Request ${requestNumber} has been created successfully`,
          "REQUEST_CREATED"
        );

      res.status(201).json({
        message:
          "Blood Request Created Successfully",
        payload: createdRequest,
      });
    } catch (err) {
      next(err);
    }
  }
);


// GET ALL OPEN REQUESTS
requestApp.get(
  "/open-requests",
  async (req, res, next) => {
    try {
      const requestsList =
        await BloodRequestModel.find({
          status: "OPEN",
          status: { $ne: "DELETED" }
        }).sort({
          priorityScore: -1,
          createdAt: -1,
        });

      res.status(200).json({
        message:
          "Open Requests Fetched Successfully",
        payload: requestsList,
      });
    } catch (err) {
      next(err);
    }
  }
);


// GET MY REQUESTS
requestApp.get(
  "/my-requests",
  verifyToken(
    "REQUESTER",
    "ADMIN"
  ),
  async (req, res, next) => {
    try {
      const requests =
        await BloodRequestModel.find({
          requestCreatedBy: req.user.userId,
          status: {
            $ne: "DELETED",
          },
        })
        .sort({
          createdAt: -1,
        });

      res.status(200).json({
        message:
          "My Requests Fetched Successfully",
        payload: requests,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET REQUEST DETAILS
requestApp.get(
  "/request/:requestNumber",
  verifyToken(
    "REQUESTER",
    "ADMIN"
  ),
  async (req, res, next) => {
    try {
      const requesterId =
        req.user.userId;

      const { requestNumber } =
        req.params;

      const request =
        await BloodRequestModel.findOne({
          requestNumber,
          status: {
            $ne: "DELETED",
          },
        });

      if (!request) {
        return res.status(404).json({
          message:
            "Blood Request Not Found",
        });
      }

      if (
        String(
          request.requestCreatedBy
        ) !== String(requesterId) &&
        req.user.role !== "ADMIN"
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to view this request",
        });
      }

      res.status(200).json({
        message:
          "Request Details Fetched Successfully",
        payload: request,
      });
    } catch (err) {
      next(err);
    }
  }
);


// EDIT REQUEST
requestApp.put(
  "/edit-request",
  verifyToken(
    "REQUESTER",
    "ADMIN"
  ),
  async (req, res, next) => {
    try {
      const {
        requestNumber,
        patientName,
        patientAge,
        patientGender,
        bloodGroup,
        unitsRequired,
        hospitalName,
        hospitalAddress,
        state,
        contactPerson,
        contactNumber,
        alertLevel,
        requiredByDate,
      } = req.body;

      const request =
        await BloodRequestModel.findOne({
          requestNumber,
        });

      if (!request) {
        return res.status(404).json({
          message:
            "Blood Request Not Found",
        });
      }

      if (
        String(
          request.requestCreatedBy
        ) !==
        String(
          req.user.userId
        )
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to edit this request",
        });
      }

      if (
        request.status !== "OPEN"
      ) {
        return res.status(400).json({
          message:
            "Only OPEN requests can be edited",
        });
      }

      request.patientName =
        patientName;

      request.patientAge =
        patientAge;

      request.patientGender =
        patientGender;

      request.bloodGroup =
        bloodGroup;

      request.unitsRequired =
        unitsRequired;

      request.hospitalName =
        hospitalName;

      request.hospitalAddress =
        hospitalAddress;

      request.state =
        state;

      request.contactPerson =
        contactPerson;

      request.contactNumber =
        contactNumber;

      request.alertLevel =
        alertLevel;

      request.requiredByDate =
        requiredByDate;

      request.priorityScore =
        calculatePriorityScore(
          alertLevel,
          unitsRequired
        );

      request.expiresAt =
        calculateExpiryDate(
          alertLevel
        );

      await request.save();

      await createNotification(
        req.user.userId,
        "Blood Request Updated",
        `Request ${requestNumber} has been updated`,
        "GENERAL"
      );

      res.status(200).json({
        message:
          "Blood Request Updated Successfully",
        payload:
          request,
      });
    } catch (err) {
      next(err);
    }
  }
);


// CLOSE REQUEST
requestApp.patch(
  "/close-request",
  verifyToken(
    "REQUESTER",
    "ADMIN"
  ),
  async (req, res, next) => {
    try {
      const {
        requestNumber,
      } = req.body;

      const request =
        await BloodRequestModel.findOne({
          requestNumber,
        });

      if (!request) {
        return res.status(404).json({
          message:
            "Blood Request Not Found",
        });
      }

      if (
        String(
          request.requestCreatedBy
        ) !==
        String(
          req.user.userId
        )
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to close this request",
        });
      }

      if (
        request.status ===
        "FULFILLED"
      ) {
        return res.status(400).json({
          message:
            "Fulfilled request cannot be closed",
        });
      }

      if (
        request.status ===
        "CLOSED"
      ) {
        return res.status(400).json({
          message:
            "Request already closed",
        });
      }

      request.status =
        "CLOSED";

      await request.save();

      await createNotification(
        req.user.userId,
        "Blood Request Closed",
        `Request ${requestNumber} has been closed`,
        "GENERAL"
      );

      res.status(200).json({
        message:
          "Blood Request Closed Successfully",

        payload:
          request,
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE REQUEST (SOFT DELETE)
requestApp.patch(
  "/delete-request",
  verifyToken(
    "REQUESTER",
    "ADMIN"
  ),
  async (req, res, next) => {
    try {
      const {
        requestNumber,
      } = req.body;

      const request =
        await BloodRequestModel.findOne({
          requestNumber,
        });

      if (!request) {
        return res.status(404).json({
          message:
            "Blood Request Not Found",
        });
      }

      if (
        String(
          request.requestCreatedBy
        ) !==
        String(
          req.user.userId
        )
      ) {
        return res.status(403).json({
          message:
            "You are not authorized to delete this request",
        });
      }

      if (
        request.status ===
        "FULFILLED"
      ) {
        return res.status(400).json({
          message:
            "Fulfilled request cannot be deleted",
        });
      }

      if (
        request.status ===
        "DELETED"
      ) {
        return res.status(400).json({
          message:
            "Request already deleted",
        });
      }

      request.status =
        "DELETED";

      await request.save();

      await createNotification(
        req.user.userId,
        "Blood Request Deleted",
        `Request ${requestNumber} has been deleted`,
        "GENERAL"
      );

      res.status(200).json({
        message:
          "Blood Request Deleted Successfully",

        payload:
          request,
      });
    } catch (err) {
      next(err);
    }
  }
);


// REQUESTER DASHBOARD
requestApp.get(
  "/dashboard",
  verifyToken(
    "REQUESTER",
    "ADMIN"
  ),
  async (req, res, next) => {
    try {
      //const requesterId =req.user.userId;

      const requests =
        await BloodRequestModel.find({
          requestCreatedBy: req.user.userId,
          status: {
            $ne: "DELETED",
          },
        });

      const totalRequests =
        requests.length;

      const openRequests =
        requests.filter(
          (r) =>
            r.status === "OPEN"
        ).length;

      const fulfilledRequests =
        requests.filter(
          (r) =>
            r.status ===
            "FULFILLED"
        ).length;

      const totalUnitsRequired =
        requests.reduce(
          (sum, request) =>
            sum +
            request.unitsRequired,
          0
        );

      const totalUnitsFulfilled =
        requests.reduce(
          (sum, request) =>
            sum +
            request.unitsFulfilled,
          0
        );

      res.status(200).json({
        message:
          "Requester Dashboard",

        payload: {
          totalRequests,

          openRequests,

          fulfilledRequests,

          totalUnitsRequired,

          totalUnitsFulfilled,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

requestApp.get("/", (req, res) => {
  res.json({
    message: "Request API Working",
  });
});

export { requestApp };