import { TranscriptionModel } from "./transcription.model";
import { retry } from "../../utils/retry";
import { ITranscriptionDocument, ITranscriptionLean } from "./transcription.types";

export class TranscriptionService {
  async create(audioUrl: string): Promise<ITranscriptionDocument> {
    await retry(() => this.mockDownload(audioUrl), 3, 300);

    const transcriptionText = "transcribed text";

    const doc = await TranscriptionModel.create({
      audioUrl,
      transcription: transcriptionText
    });

    return doc as ITranscriptionDocument;
  }

  async list(): Promise<ITranscriptionLean[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const results = await TranscriptionModel.find({ createdAt: { $gte: thirtyDaysAgo } })
      .sort({ createdAt: -1 })
      .lean();

    return results as ITranscriptionLean[];
  }

  private async mockDownload(url: string): Promise<boolean> {
    if (!url) throw new Error("No URL provided");

    await new Promise((r) => setTimeout(r, 150));
    const fail = Math.random() < 0.15;
    if (fail) throw new Error("Mock download failed");
    return true;
  }
}
