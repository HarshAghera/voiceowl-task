import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri);

    console.log("✔ Connected to MongoDB In-Memory Server");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
    console.log("In-Memory MongoDB Server stopped");
  }
}
