"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
exports.disconnectDB = disconnectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_memory_server_1 = require("mongodb-memory-server");
let mongoServer = null;
async function connectDB() {
    try {
        mongoServer = await mongodb_memory_server_1.MongoMemoryServer.create();
        const uri = mongoServer.getUri();
        await mongoose_1.default.connect(uri);
        console.log("✔ Connected to MongoDB In-Memory Server");
    }
    catch (err) {
        console.error("MongoDB connection error:", err);
        throw err;
    }
}
async function disconnectDB() {
    await mongoose_1.default.disconnect();
    if (mongoServer) {
        await mongoServer.stop();
        console.log("In-Memory MongoDB Server stopped");
    }
}
