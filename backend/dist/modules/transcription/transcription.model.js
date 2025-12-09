"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionModel = void 0;
const mongoose_1 = require("mongoose");
const transcriptionSchema = new mongoose_1.Schema({
    audioUrl: { type: String, required: true },
    transcription: { type: String, required: true }
}, {
    timestamps: true
});
// Index createdAt for range queries
transcriptionSchema.index({ createdAt: 1 });
exports.TranscriptionModel = (0, mongoose_1.model)("Transcription", transcriptionSchema);
