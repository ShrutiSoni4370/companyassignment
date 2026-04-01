import { User } from "../models/user.js";
import Charity from "../models/charity.js"
import SubscriptionPlan from "../models/subcription.js";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async ({ name, email, password }) => {

  // 1. Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("User already exists");
  }

  // 2. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 3. Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Generate token (AFTER user is created ✅)
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 5. Return safe response
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    token,
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    token,
  };
};

export const logout = async (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

//charityService

export const createCharity = async (data) => {
  try {
    console.log("📥 Creating charity with data:", data);  // Add this

    const charity = await Charity.create({
      ...data
    });

    console.log("✅ Charity created:", charity);  // Add this
    return charity;
  } catch (error) {
    console.error("❌ Charity creation error:", error);  // Add this
    throw new Error(error.message || "Failed to create charity");
  }
};

export const getAllCharities = async () => {
  try {
    console.log("📥 Fetching all charities");
    const charities = await Charity.find().sort({ createdAt: -1 });
    return charities;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch charities");
  }
};

export const getCharityById = async (id) => {
  try {
    const charity = await Charity.findById(id);

    if (!charity) {
      throw new Error("Charity not found");
    }

    return charity;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch charity");
  }
};

export const updateCharity = async (id, data) => {
  try {
    const updatedCharity = await Charity.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedCharity) {
      throw new Error("Charity not found");
    }

    return updatedCharity;
  } catch (error) {
    throw new Error(error.message || "Failed to update charity");
  }
};

export const deleteCharity = async (id) => {
  try {
    const deletedCharity = await Charity.findByIdAndDelete(id);

    if (!deletedCharity) {
      throw new Error("Charity not found");
    }

    return deletedCharity;
  } catch (error) {
    throw new Error(error.message || "Failed to delete charity");
  }
};

// /subscriptionPlanService

export const createSubscriptionPlan = async (data) => {
  try {
    const plan = await SubscriptionPlan.create({
      ...data,

    });

    return plan;
  } catch (error) {
    throw new Error(error.message || "Failed to create subscription plan");
  }
};

export const getAllSubscriptionPlans = async () => {
  try {
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 });

    return plans;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch subscription plans");
  }
};

export const getSubscriptionPlanById = async (id) => {
  try {
    const plan = await SubscriptionPlan.findById(id);

    if (!plan) {
      throw new Error("Subscription plan not found");
    }

    return plan;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch subscription plan");
  }
};

export const updateSubscriptionPlan = async (id, data) => {
  try {
    const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      throw new Error("Subscription plan not found");
    }

    return updatedPlan;
  } catch (error) {
    throw new Error(error.message || "Failed to update subscription plan");
  }
};

export const deleteSubscriptionPlan = async (id) => {
  try {
    const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      throw new Error("Subscription plan not found");
    }

    return deletedPlan;
  } catch (error) {
    throw new Error(error.message || "Failed to delete subscription plan");
  }
};

// services/userService.js


export const getAllUsers = async () => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return users;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch users");
  }
};

export const getUserById = async (id) => {
  try {
    const user = await User.findById(id).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    throw new Error(error.message || "Failed to fetch user");
  }
};

export const updateUser = async (id, data) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error) {
    throw new Error(error.message || "Failed to update user");
  }
};

export const deleteUser = async (id) => {
  try {
    const deletedUser = await User.findByIdAndDelete(id).select("-password");

    if (!deletedUser) {
      throw new Error("User not found");
    }

    return deletedUser;
  } catch (error) {
    throw new Error(error.message || "Failed to delete user");
  }
};

//scoreService.js

export const selectCharityService = async (
  userId,
  charityId,
  contributionPercentage
) => {
  if (!charityId) {
    throw new Error("Charity id is required");
  }

  const contribution = Number(contributionPercentage);

  if (Number.isNaN(contribution)) {
    throw new Error("Contribution percentage must be a number");
  }

  if (contribution < 10) {
    throw new Error("Contribution percentage must be at least 10");
  }

  const charity = await Charity.findById(charityId);
  if (!charity) {
    throw new Error("Charity not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  if (!user.charity) {
    user.charity = {};
  }

  user.charity.charityId = charityId;
  user.charity.contributionPercentage = contribution;

  user.subscription = {
    ...user.subscription,
    selectedSubscriptionId: subscriptionId,
    status: "Active",
  };
  await user.save();

  return await User.findById(userId).populate("charity.charityId");
};



export const selectSubscriptionService = async (userId, subscriptionId) => {
  if (!subscriptionId) {
    throw new Error("Subscription id is required");
  }

  const subscriptionPlan = await SubscriptionPlan.findById(subscriptionId);
  if (!subscriptionPlan) {
    throw new Error("Subscription plan not found");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.subscription.selectedSubscriptionId = subscriptionId;
  user.subscription.status = "Pending";

  await user.save();

  return await User.findById(userId).populate("subscription.selectedSubscriptionId");
};

export const deleteScoreService = async (userId, scoreId) => {
  if (!scoreId) {
    throw new Error("Score id is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const scoreExists = user.scores.some(
    (item) => item._id.toString() === scoreId
  );

  if (!scoreExists) {
    throw new Error("Score not found");
  }

  user.scores = user.scores.filter(
    (item) => item._id.toString() !== scoreId
  );

  await user.save();

  user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));

  return user;
};

export const addScoreService = async (userId, stableford, date, course = "") => {
  const scoreValue = Number(stableford);

  if (Number.isNaN(scoreValue) || scoreValue < 1 || scoreValue > 45) {
    throw new Error("Stableford score must be between 1 and 45");
  }

  if (!date) {
    throw new Error("Score date is required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.scores.push({
    stableford: scoreValue,
    date,
    course,
  });

  user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (user.scores.length > 5) {
    user.scores = user.scores.slice(0, 5);
  }

  await user.save();

  return user.scores.sort((a, b) => new Date(b.date) - new Date(a.date));
};

//run the draw




export const runDrawService = async () => {
  try {
    console.log("\n================ RUN DRAW START ================");

    // ✅ SIMPLIFIED: Only check subscription exists, ignore status
    const participants = await User.find({
      "subscription.selectedSubscriptionId": { $ne: null }
    })
      .populate("subscription.selectedSubscriptionId")
      .populate("charity.charityId");

    console.log("Participants found (no status check):", participants.length);

    if (!participants.length) {
      throw new Error("No users with subscriptions found");
    }

    // Rest of your logic stays the same...
    const prizeAmount = 1000;
    const charityAmount = prizeAmount * 0.1;
    const winnerGiftAmount = prizeAmount - charityAmount;

    const weightedEntries = participants.map((user) => {
      const totalScore = Array.isArray(user.scores)
        ? user.scores.reduce((sum, item) => sum + Number(item?.stableford || 0), 0)
        : 0;
      
      const entries = Math.max(totalScore, 1);

      return { user, score: totalScore, entries };
    });

    // Weighted random selection...
    const totalWeight = weightedEntries.reduce((sum, item) => sum + item.entries, 0);
    let random = Math.floor(Math.random() * totalWeight);
    let selected = null;

    for (const item of weightedEntries) {
      random -= item.entries;
      if (random < 0) {
        selected = item;
        break;
      }
    }

    if (!selected?.user) {
      throw new Error("Failed to select winner");
    }

    const winner = selected.user;
    winner.winnings = Array.isArray(winner.winnings) ? winner.winnings : [];
    winner.winnings.push({
      amount: winnerGiftAmount,
      paymentStatus: "pending",
      createdAt: new Date(),
    });
    winner.drawsEntered = Number(winner.drawsEntered || 0) + 1;

    await winner.save();

    if (winner?.charity?.charityId?._id) {
      await Charity.findByIdAndUpdate(winner.charity.charityId._id, {
        $inc: { totalRaised: charityAmount },
      });
    }

    return {
      participantsCount: participants.length,
      winner: {
        _id: winner._id,
        name: winner.name,
        email: winner.email,
        score: selected.score,
        giftAmount: winnerGiftAmount,
        charityAmount,
        charityId: winner?.charity?.charityId?._id || null,
        charityName: winner?.charity?.charityId?.name || null,
      },
    };
  } catch (error) {
    console.error("RUN DRAW SERVICE ERROR:", error.message);
    throw error;
  }
};