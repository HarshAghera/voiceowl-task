import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3000;
export const MONGO_URI = process.env.MONGO_URI || "";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY || "";
export const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "";
