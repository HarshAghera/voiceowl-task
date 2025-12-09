"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AZURE_SPEECH_REGION = exports.AZURE_SPEECH_KEY = exports.MONGO_URI = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.PORT = process.env.PORT || 3000;
exports.MONGO_URI = process.env.MONGO_URI || "";
exports.AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY || "";
exports.AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "";
