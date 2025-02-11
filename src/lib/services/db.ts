import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is not defined in .env");
}

export const connectDB = async (): Promise<void> => {
  try {
    if (mongoose.connection.readyState >= 1) {
      console.log("✅ MongoDB already connected");
      return;
    }

    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB connected successfully");

    mongoose.connection.on("error", (error) => {
      console.error("❌ MongoDB connection error:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
  }
};