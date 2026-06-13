import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      unique: true,
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

    state: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["DONOR", "REQUESTER", "ADMIN"],
      default: "DONOR",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    profileImageUrl: {
      type: String,
      default: "",
    },

    donationsCount: {
      type: Number,
      default: 0,
    },

    totalPoints: {
      type: Number,
      default: 0,
    },

    donorLevel: {
      type: String,
      enum: [
        "Iron",
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Diamond"
      ],
      default: "Iron",
    },

    badges: {
      type: [String],
      default: [],
    },

    notifications: {
      type: [String],
      default: [],
    },

    lastDonationDate: {
      type: Date,
      default: null,
    },

    nextEligibleDonationDate: {
      type: Date,
      default: null,
    },

    isUserActive: {
      type: Boolean,
      default: true,
    },
    loginHistory: {
        type: [Date],
        default: []
    },
    lastLogin: {
        type: Date,
        default: null
    },
    availabilityUpdatedAt: {
        type: Date,
        default: null
    }
  },
  {
    timestamps: true,
  }
);

userSchema.index({
  role: 1,
  isAvailable: 1,
  state: 1,
  bloodGroup: 1,
});


export const UserModel = model("user", userSchema);