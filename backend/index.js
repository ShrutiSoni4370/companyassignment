import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./models/config.js";
import authRoutes from "./routes/route.js";
// import userroutes from "./routes/userRoute.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("dist"));

app.use(
  cors({
    origin: [
    "http://localhost:5173",
    "https://companyassignment-1-hcmj.onrender.com"
  ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use("/auth", authRoutes);

// app.use("/users",userroutes);

app.get("/", (req, res) => {
  res.send("API is running");
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error.message);
  }
};

startServer();
