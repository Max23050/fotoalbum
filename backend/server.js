import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import albumRoutes from "./routes/album.js";
import photoRoutes from "./routes/photo.js"; 
import path from "path";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/photos", photoRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    app.listen(4000, () => {
      console.log("Server running on port 4000");
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

startServer();