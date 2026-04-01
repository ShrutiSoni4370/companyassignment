import mongoose from "mongoose";

const scoreSchema = new mongoose.Schema(
  {
    stableford: { 
      type: Number, 
      min: 1, 
      max: 45, 
      required: true 
    },
    date: { 
      type: Date, 
      required: true 
    },
    course: { 
      type: String, 
      trim: true,
      default: "" 
    },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },
    password: { 
      type: String, 
      required: true 
    },

    // ✅ FIXED: subscription nested object
    subscription: {
      selectedSubscriptionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubscriptionPlan", // ✅ CHANGED: match your actual model name
        default: null,
      },
      status: {
        type: String,
        enum: ["Inactive", "Pending", "Active", "Cancelled"],
        default: "Active",
      },
      renewalDate: {
        type: Date,
        default: null,
      },
    },

    // ✅ FIXED: charity nested object
    charity: {
      charityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Charity",
        default: null,
      },
      contributionPercentage: {
        type: Number,
        min: 10,
        max: 100,
        default: 10, // ✅ CHANGED: default to 10% instead of null
      },
    },

    // ✅ FIXED: scores validation
    scores: {
      type: [scoreSchema],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length <= 5;
        },
        message: "Only last 5 scores are allowed.",
      },
    },

    drawsEntered: { 
      type: Number, 
      default: 0, 
      min: 0 
    },
    upcomingDrawDate: { 
      type: Date, 
      default: null 
    },

    winnings: {
      type: [
        {
          amount: { 
            type: Number, 
            default: 0 
          },
          paymentStatus: {
            type: String,
            enum: ["pending", "paid"],
            default: "pending",
          },
          createdAt: { 
            type: Date, 
            default: Date.now 
          },
        },
      ],
      default: [],
    },
  },
  { 
    timestamps: true 
  }
);

// ✅ Add instance methods for convenience
userSchema.methods.addScore = function(newScore) {
  this.scores.push(newScore);
  
  // Sort by date descending (most recent first)
  this.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // Keep only last 5
  if (this.scores.length > 5) {
    this.scores = this.scores.slice(0, 5);
  }
  
  return this.save();
};

export const User = mongoose.model("User", userSchema);