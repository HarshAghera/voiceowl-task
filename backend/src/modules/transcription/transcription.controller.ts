import { Request, Response } from "express";
import { TranscriptionService } from "./transcription.service";

const transcriptionService = new TranscriptionService();

export class TranscriptionController {
  async create(req: Request, res: Response) {
    try {
      const { audioUrl } = req.body;
      if (!audioUrl || typeof audioUrl !== "string") {
        return res.status(400).json({ error: "audioUrl is required and must be a string" });
      }

      const doc = await transcriptionService.create(audioUrl);
      return res.status(201).json({ id: doc._id });
    } catch (err: any) {
      console.error("create transcription error:", err?.message ?? err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const items = await transcriptionService.list();
      return res.json({ items });
    } catch (err) {
      console.error("list transcriptions error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}
