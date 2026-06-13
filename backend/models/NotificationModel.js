import { Schema, model } from "mongoose";

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: [
        "REQUEST_CREATED",
        "REQUEST_ACCEPTED",
        "DONATION_COMPLETED",
        "BADGE_EARNED",
        "GENERAL",
      ],
      default: "GENERAL",
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = model(
  "notification",
  notificationSchema
);