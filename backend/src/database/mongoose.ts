import mongoose from "mongoose";
import { MONGO_URI } from "../config/env";

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(MONGO_URI, {} as mongoose.ConnectOptions);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
