import { Schema, model } from "mongoose";

const donationSchema = new Schema(
  {
    donorId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    bloodRequestId: {
      type: Schema.Types.ObjectId,
      ref: "bloodrequest",
      required: true,
    },

    requestNumber: {
      type: String,
      required: true,
    },

    alertLevel: {
      type: String,
      required: true,
      enum: [
        "GREEN",
        "YELLOW",
        "RED",
        "BLACK",
      ],
    },

    pointsAwarded: {
      type: Number,
      required: true,
      default: 0,
    },

    unitsDonated: {
      type: Number,
      default: 1,
      min: 1,
    },

    donationDate: {
      type: Date,
      default: Date.now,
    },

    nextEligibleDonationDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "CONFIRMED",
        "REJECTED",
      ],
      default: "PENDING",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

donationSchema.index({
  donorId: 1,
  createdAt: -1,
});

export const DonationModel = model(
  "donation",
  donationSchema
);