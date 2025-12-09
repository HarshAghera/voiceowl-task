"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranscriptionController = void 0;
const transcription_service_1 = require("./transcription.service");
const transcriptionService = new transcription_service_1.TranscriptionService();
class TranscriptionController {
    async create(req, res) {
        try {
            const { audioUrl } = req.body;
            if (!audioUrl || typeof audioUrl !== "string") {
                return res.status(400).json({ error: "audioUrl is required and must be a string" });
            }
            const doc = await transcriptionService.create(audioUrl);
            return res.status(201).json({ id: doc._id });
        }
        catch (err) {
            console.error("create transcription error:", err?.message ?? err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
    async list(req, res) {
        try {
            const items = await transcriptionService.list();
            return res.json({ items });
        }
        catch (err) {
            console.error("list transcriptions error:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}
exports.TranscriptionController = TranscriptionController;
