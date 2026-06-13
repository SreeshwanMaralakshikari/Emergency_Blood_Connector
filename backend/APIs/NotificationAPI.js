import exp from "express";
import { NotificationModel }from "../models/NotificationModel.js";
import { verifyToken }from "../middlewares/verifyToken.js";

const notificationApp = exp.Router();

// GET MY NOTIFICATIONS
notificationApp.get(
  "/my-notifications",
  verifyToken(),
  async (req, res, next) => {
    try {
      const notifications =
        await NotificationModel.find({
          userId:
            req.user.userId,
        }).sort({
          createdAt: -1,
        });

      res.status(200).json({
        message:
          "Notifications Fetched Successfully",

        payload:
          notifications,
      });
    } catch (err) {
      next(err);
    }
  }
);


// GET UNREAD COUNT
notificationApp.get(
  "/unread-count",
  verifyToken(),
  async (req, res, next) => {
    try {
      const count =
        await NotificationModel.countDocuments(
          {
            userId:
              req.user.userId,

            isRead: false,
          }
        );

      res.status(200).json({
        unreadCount: count,
      });
    } catch (err) {
      next(err);
    }
  }
);


// MARK AS READ
notificationApp.put(
  "/mark-read/:id",
  verifyToken(),
  async (req, res, next) => {
    try {
      const notification =
        await NotificationModel.findOneAndUpdate(
          {
            _id:
              req.params.id,

            userId:
              req.user.userId,
          },
          {
            isRead: true,
          },
          {
            new: true,
          }
        );

      if (!notification) {
        return res.status(404).json({
          message:
            "Notification Not Found",
        });
      }

      res.status(200).json({
        message:
          "Notification Marked As Read",

        payload:
          notification,
      });
    } catch (err) {
      next(err);
    }
  }
);


notificationApp.get(
  "/",
  (req, res) => {
    res.json({
      message:
        "Notification API Working",
    });
  }
);

export { notificationApp };