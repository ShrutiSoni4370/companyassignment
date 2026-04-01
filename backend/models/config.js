import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected ✅");
    console.log("Mongoose readyState:", mongoose.connection.readyState); // Should be 1
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};