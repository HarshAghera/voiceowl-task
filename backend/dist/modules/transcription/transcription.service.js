"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionService = void 0;
const transcription_model_1 = require("./transcription.model");
const retry_1 = require("../../utils/retry");
class TranscriptionService {
    async create(audioUrl) {
        await (0, retry_1.retry)(() => this.mockDownload(audioUrl), 3, 300);
        const transcriptionText = "transcribed text";
        const doc = await transcription_model_1.TranscriptionModel.create({
            audioUrl,
            transcription: transcriptionText
        });
        return doc;
    }
    async list() {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const results = await transcription_model_1.TranscriptionModel.find({ createdAt: { $gte: thirtyDaysAgo } })
            .sort({ createdAt: -1 })
            .lean();
        return results;
    }
    async mockDownload(url) {
        if (!url)
            throw new Error("No URL provided");
        await new Promise((r) => setTimeout(r, 150));
        const fail = Math.random() < 0.15;
        if (fail)
            throw new Error("Mock download failed");
        return true;
    }
}
exports.TranscriptionService = TranscriptionService;
