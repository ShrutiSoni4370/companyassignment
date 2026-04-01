import mongoose from "mongoose";

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Charity name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    membersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalRaised: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Charity", charitySchema);