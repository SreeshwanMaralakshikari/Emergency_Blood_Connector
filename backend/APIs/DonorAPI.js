import exp from "express";

import { verifyToken } from "../middlewares/verifyToken.js";

import { UserModel } from "../models/UserModel.js";

import { BloodRequestModel } from "../models/BloodRequestModel.js";

import { DonationModel } from "../models/DonationModel.js";

import { calculatePoints } from "../utils/calculatePoints.js";

import { calculateLevel } from "../utils/calculateLevel.js";

import {
  calculateNextEligibleDate,
} from "../utils/donationCooldown.js";

import {
  canDonate,
} from "../utils/bloodCompatibility.js";

import {
  calculateBadges,
} from "../utils/calculateBadges.js";

import {
  createNotification,
} from "../utils/createNotification.js";

const donorApp = exp.Router();

// GET MY MATCHED REQUESTS
donorApp.get(
  "/my-matched-requests",
  verifyToken("DONOR"),
  async (req, res, next) => {
    try {
      const donor =
        await UserModel.findById(
          req.user.userId
        );

      if (!donor) {
        return res.status(404).json({
          message: "Donor Not Found",
        });
      }

      const allOpenRequests =
        await BloodRequestModel.find({
          status: "OPEN",
          state: donor.state,
        }).sort({
          priorityScore: -1,
          createdAt: -1,
        });

      const matchedRequests =
        allOpenRequests.filter(
          (request) =>
            canDonate(
              donor.bloodGroup,
              request.bloodGroup
            )
        );

      res.status(200).json({
        message:
          "Matched Requests Fetched Successfully",
        payload: matchedRequests,
      });
    } catch (err) {
      next(err);
    }
  }
);


// GET MY ACCEPTED REQUESTS
donorApp.get(
  "/my-accepted-requests",
  verifyToken("DONOR"),
  async (req, res, next) => {
    try {
      const donorId =
        req.user.userId;

      const requests =
        await BloodRequestModel.find({
          acceptedDonors: {
            $elemMatch: {
              donorId,
            },
          },
        })
          .sort({
            priorityScore: -1,
            createdAt: -1,
          });

      const formattedRequests =
        requests.map(
          (request) => {
            const donorAcceptance =
              request.acceptedDonors.find(
                (donorObj) =>
                  String(
                    donorObj.donorId
                  ) ===
                  String(donorId)
              );

            return {
              requestId:
                request._id,

              requestNumber:
                request.requestNumber,

              patientName:
                request.patientName,

              bloodGroup:
                request.bloodGroup,

              alertLevel:
                request.alertLevel,

              hospitalName:
                request.hospitalName,

              hospitalAddress:
                request.hospitalAddress,

              contactPerson:
                request.contactPerson,

              contactNumber:
                request.contactNumber,

              unitsRequired:
                request.unitsRequired,

              unitsFulfilled:
                request.unitsFulfilled,

              status:
                request.status,

              acceptedAt:
                donorAcceptance?.acceptedAt,
            };
          }
        );

      res.status(200).json({
        message:
          "Accepted Requests Fetched Successfully",

        payload:
          formattedRequests,
      });
    } catch (err) {
      next(err);
    }
  }
);


// GET MY DONATION HISTORY
donorApp.get(
  "/my-donations",
  verifyToken("DONOR"),
  async (req, res, next) => {
    try {
      const donorId =
        req.user.userId;

      const donations =
        await DonationModel.find({
          donorId,
        })
          .sort({
            donationDate: -1,
          });

      res.status(200).json({
        message:
          "Donation History Fetched Successfully",

        payload: donations,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET MY BADGES
donorApp.get(
  "/my-badges",
  verifyToken("DONOR"),
  async (req, res, next) => {
    try {
      const donor =
        await UserModel.findById(
          req.user.userId
        ).select(
          "donorLevel totalPoints donationsCount"
        );

      if (!donor) {
        return res.status(404).json({
          message: "Donor Not Found",
        });
      }

      const badges =
        calculateBadges(
          donor.donationsCount,
          donor.totalPoints
        );

      res.status(200).json({
        message:
          "Badges Fetched Successfully",

        payload: {
          donationsCount:
            donor.donationsCount,

          totalPoints:
            donor.totalPoints,

          donorLevel:
            donor.donorLevel,

          badges,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET LEADERBOARD
donorApp.get(
  "/leaderboard",
  async (req, res, next) => {
    try {
      const donors =
        await UserModel.find({
          role: "DONOR",
        })
          .select(
            "firstName lastName donorLevel totalPoints donationsCount"
          )
          .sort({
            totalPoints: -1,
            donationsCount: -1,
          });

      const leaderboard =
        donors.map(
          (donor, index) => ({
            rank: index + 1,

            donorId:
              donor._id,

            donorName:
              `${donor.firstName} ${donor.lastName}`,

            donorLevel:
              donor.donorLevel,

            totalPoints:
              donor.totalPoints,

            donationsCount:
              donor.donationsCount,
          })
        );

      res.status(200).json({
        message:
          "Leaderboard Fetched Successfully",

        payload:
          leaderboard,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET TOP DONORS
donorApp.get(
  "/top-donors",
  async (req, res, next) => {
    try {
      const topDonors =
        await UserModel.find({
          role: "DONOR",
        })
          .select(
            "firstName lastName donorLevel totalPoints donationsCount"
          )
          .sort({
            totalPoints: -1,
            donationsCount: -1,
          })
          .limit(3);

      res.status(200).json({
        message:
          "Top Donors Fetched Successfully",

        payload: topDonors,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET MY RANK
donorApp.get(
  "/my-rank",
  verifyToken("DONOR"),
  async (req, res, next) => {
    try {
      const donorId =
        req.user.userId;

      const donors =
        await UserModel.find({
          role: "DONOR",
        })
          .select(
            "firstName lastName donorLevel totalPoints donationsCount"
          )
          .sort({
            totalPoints: -1,
            donationsCount: -1,
          });

      const rank =
        donors.findIndex(
          (donor) =>
            String(donor._id) ===
            String(donorId)
        ) + 1;

      const donor =
        donors.find(
          (donor) =>
            String(donor._id) ===
            String(donorId)
        );

      if (!donor) {
        return res.status(404).json({
          message:
            "Donor Not Found",
        });
      }

      res.status(200).json({
        message:
          "Rank Fetched Successfully",

        payload: {
          rank,

          donorId:
            donor._id,

          donorName:
            `${donor.firstName} ${donor.lastName}`,

          donorLevel:
            donor.donorLevel,

          totalPoints:
            donor.totalPoints,

          donationsCount:
            donor.donationsCount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);


// GET MY ACHIEVEMENTS
donorApp.get(
  "/my-achievements",
  verifyToken("DONOR"),
  async (req, res, next) => {
    try {
      const donor =
        await UserModel.findById(
          req.user.userId
        ).select(
          "donationsCount totalPoints donorLevel"
        );

      if (!donor) {
        return res.status(404).json({
          message:
            "Donor Not Found",
        });
      }

      const badges =
        calculateBadges(
          donor.donationsCount,
          donor.totalPoints
        );

      res.status(200).json({
        message:
          "Achievements Fetched Successfully",

        payload: {
          donorLevel:
            donor.donorLevel,

          totalPoints:
            donor.totalPoints,

          donationsCount:
            donor.donationsCount,

          badgesUnlocked:
            badges.length,

          badges,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// DONOR DASHBOARD
donorApp.get(
  "/dashboard",
  verifyToken("DONOR"),
  async (req, res, next) => {
    try {
      const donor =
        await UserModel.findById(
          req.user.userId
        ).select("-password");

      if (!donor) {
        return res.status(404).json({
          message: "Donor Not Found",
        });
      }

      const totalMatchedRequests =
        (
          await BloodRequestModel.find({
            status: "OPEN",
            state: donor.state,
          })
        ).filter((request) =>
          canDonate(
            donor.bloodGroup,
            request.bloodGroup
          )
        ).length;

      const totalAcceptedRequests =
        await BloodRequestModel.countDocuments({
          acceptedDonors: {
            $elemMatch: {
              donorId:
                donor._id,
            },
          },
        });

      const totalDonations =
        await DonationModel.countDocuments({
          donorId:
            donor._id,
        });

      res.status(200).json({
        message:
          "Dashboard Data",

        payload: {
          donorName:
            `${donor.firstName} ${donor.lastName}`,

          bloodGroup:
            donor.bloodGroup,

          donorLevel:
            donor.donorLevel,

          totalPoints:
            donor.totalPoints,

          donationsCount:
            donor.donationsCount,

          isAvailable:
            donor.isAvailable,

          nextEligibleDonationDate:
            donor.nextEligibleDonationDate,

          totalMatchedRequests,

          totalAcceptedRequests,

          totalDonations,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ACCEPT BLOOD REQUEST
donorApp.put(
  "/accept-request",
  verifyToken("DONOR"),
  async (req, res, next) => {
    try {
      const { requestNumber } =
        req.body;

      const donorId =
        req.user.userId;

      const donor =
        await UserModel.findById(
          donorId
        );

      if (!donor) {
        return res.status(404).json({
          message:
            "Donor Not Found",
        });
      }

      if (!donor.isAvailable) {
        return res.status(400).json({
          message:
            "Donation cooldown active",

          nextEligibleDonationDate:
            donor.nextEligibleDonationDate,
        });
      }

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
        request.status !== "OPEN"
      ) {
        return res.status(400).json({
          message:
            "This blood request is no longer open",
        });
      }

      if (
        request.unitsFulfilled >=
        request.unitsRequired
      ) {
        return res.status(400).json({
          message:
            "This blood request has already been fulfilled",
        });
      }

      if (
        request.state !== donor.state
      ) {
        return res.status(403).json({
          message:
            "You are not eligible for this request",
        });
      }

      if (
        !canDonate(
          donor.bloodGroup,
          request.bloodGroup
        )
      ) {
        return res.status(403).json({
          message:
            "You are not compatible for this blood request",
        });
      }

      if (
        request.acceptedDonors.some(
          (donorObj) =>
            String(
              donorObj.donorId
            ) === String(donorId)
        )
      ) {
        return res.status(400).json({
          message:
            "You have already accepted this request",
        });
      }

      request.acceptedDonors.push({
        donorId,
        acceptedAt: new Date(),
      });

      await request.save();

      try {
        if (request.requestCreatedBy) {
          await createNotification(
            request.requestCreatedBy,
            "Request Accepted",
            `${donor.firstName} ${donor.lastName} accepted request ${request.requestNumber}`,
            "REQUEST_ACCEPTED"
          );
        }
      } catch (error) {
        console.error(error);
      }

      res.status(200).json({
        message:
          "Donation Request Accepted Successfully",

        payload: request,
      });
    } catch (err) {
      next(err);
    }
  }
);


// COMPLETE DONATION
donorApp.put(
  "/complete-donation",
  verifyToken("DONOR"),
  async (req, res, next) => {
    try {
      const { requestNumber } =
        req.body;

      const donorId =
        req.user.userId;

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
        request.status !== "OPEN"
      ) {
        return res.status(400).json({
          message:
            "This blood request is no longer open",
        });
      }

      if (
        request.unitsFulfilled >=
        request.unitsRequired
      ) {
        return res.status(400).json({
          message:
            "This blood request has already been fulfilled",
        });
      }

      const donorAccepted =
        request.acceptedDonors.some(
          (donorObj) =>
            String(
              donorObj.donorId
            ) === String(donorId)
        );

      if (!donorAccepted) {
        return res.status(400).json({
          message:
            "You have not accepted this request",
        });
      }

      if (
        request.completedDonors.some(
          (id) =>
            String(id) ===
            String(donorId)
        )
      ) {
        return res.status(400).json({
          message:
            "Donation already completed",
        });
      }

      const donor =
        await UserModel.findById(
          donorId
        );

      if (!donor) {
        return res.status(404).json({
          message:
            "Donor Not Found",
        });
      }

      if (!donor.isAvailable) {
        return res.status(400).json({
          message:
            "Donation cooldown active",

          nextEligibleDonationDate:
            donor.nextEligibleDonationDate,
        });
      }

      const donationDate =
        new Date();

      const pointsAwarded =
        calculatePoints(
          request.alertLevel
        );

      const nextEligibleDonationDate =
        calculateNextEligibleDate(
          donationDate
        );

      const donationRecord =
        await DonationModel.create({
          donorId:
            donor._id,

          bloodRequestId:
            request._id,

          requestNumber:
            request.requestNumber,

          alertLevel:
            request.alertLevel,

          pointsAwarded,

          unitsDonated: 1,

          donationDate,

          nextEligibleDonationDate,

          status: "CONFIRMED",

          isVerified: true,
        });

      donor.totalPoints +=
        pointsAwarded;

      donor.donationsCount += 1;

      donor.donorLevel =
        calculateLevel(
          donor.totalPoints
        );

      const oldBadges =
        donor.badges || [];

      const newBadges =
        calculateBadges(
          donor.donationsCount,
          donor.totalPoints
        );

      donor.badges =
        newBadges;

      donor.lastDonationDate =
        donationDate;

      donor.nextEligibleDonationDate =
        nextEligibleDonationDate;

      donor.isAvailable =
        false;

      donor.availabilityUpdatedAt =
        donationDate;

      await donor.save();

      request.completedDonors.push(
        donor._id
      );

      request.acceptedDonors =
        request.acceptedDonors.filter(
          (donorObj) =>
            String(
              donorObj.donorId
            ) !== String(donorId)
        );

      request.unitsFulfilled += 1;

      if (
        request.unitsFulfilled >=
        request.unitsRequired
      ) {
        request.status =
          "FULFILLED";
      }

      await request.save();

      try {
        await createNotification(
          donor._id,
          "Donation Completed",
          `You earned ${pointsAwarded} points for donating blood`,
          "DONATION_COMPLETED"
        );
      } catch (error) {
        console.error(error);
      }

      try {
        if (request.requestCreatedBy) {
          await createNotification(
            request.requestCreatedBy,
            "Blood Request Updated",
            `A donation has been completed for request ${request.requestNumber}`,
            "DONATION_COMPLETED"
          );
        }
      } catch (error) {
        console.error(error);
      }

      const earnedBadges =
        newBadges.filter(
          (badge) =>
            !oldBadges.includes(
              badge
            )
        );

      for (
        const badge of earnedBadges
      ) {
        try {
          await createNotification(
            donor._id,
            "New Badge Earned",
            `Congratulations! You earned the badge "${badge}"`,
            "BADGE_EARNED"
          );
        } catch (error) {
          console.error(error);
        }
      }

      const donorObj =
        donor.toObject();

      delete donorObj.password;

      res.status(200).json({
        message:
          "Donation Completed Successfully",

        donation:
          donationRecord,

        donor:
          donorObj,

        request,
      });
    } catch (err) {
      next(err);
    }
  }
);


donorApp.get("/", (req, res) => {
  res.json({
    message: "Donor API Working",
  });
});

export { donorApp };