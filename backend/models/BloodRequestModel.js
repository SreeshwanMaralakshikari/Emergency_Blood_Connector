import { Schema, model } from "mongoose";

const bloodRequestSchema = new Schema(
  {
    requestNumber: {
      type: String,
      unique: true,
      required: true,
    },

    patientName: {
      type: String,
      required: true,
      trim: true,
    },

    patientAge: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },

    patientGender: {
      type: String,
      required: true,
      enum: ["MALE", "FEMALE", "OTHER"],
    },

    bloodGroup: {
      type: String,
      required: true,
      enum: [
        "O+",
        "O-",
        "A+",
        "A-",
        "B+",
        "B-",
        "AB+",
        "AB-",
      ],
    },

    unitsRequired: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },

    unitsFulfilled: {
      type: Number,
      default: 0,
    },

    hospitalName: {
      type: String,
      required: true,
      trim: true,
    },

    hospitalAddress: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
    },

    contactPerson: {
      type: String,
      required: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    requestCreatedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
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

    status: {
      type: String,
      enum: [
      "OPEN",
      "FULFILLED",
      "CLOSED",
      "EXPIRED",
      "DELETED",
      ],
      default: "OPEN",
    },

    acceptedDonors: [
      {
        _id: false,

        donorId: {
          type: Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },

        acceptedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    completedDonors: [
      {
        type: Schema.Types.ObjectId,
        ref: "user",
      },
    ],

    priorityScore: {
      type: Number,
      default: 0,
    },

    isHospitalVerified: {
      type: Boolean,
      default: false,
    },

    requiredByDate: {
      type: Date,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

bloodRequestSchema.index({
  status: 1,
  priorityScore: -1,
});

export const BloodRequestModel = model(
  "bloodrequest",
  bloodRequestSchema
);