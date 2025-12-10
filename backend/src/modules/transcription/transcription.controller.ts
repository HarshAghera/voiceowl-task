import { Request, Response } from 'express';
import { TranscriptionService } from './transcription.service';

const transcriptionService = new TranscriptionService();

export class TranscriptionController {
  async create(req: Request, res: Response) {
    try {
      const { audioUrl } = req.body;
      if (!audioUrl || typeof audioUrl !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request',
          error: 'audioUrl is required and must be a string',
        });
      }

      const doc = await transcriptionService.create(audioUrl);

      return res.status(201).json({
        success: true,
        message: 'Transcription created successfully',
        data: { id: doc._id },
      });
    } catch (err: any) {
      console.error('create transcription error:', err?.message ?? err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err?.message ?? 'Something went wrong',
      });
    }
  }

  async list(req: Request, res: Response) {
    try {
      const items = await transcriptionService.list();

      return res.json({
        success: true,
        message: 'Transcription list fetched successfully',
        data: { items },
      });
    } catch (err: any) {
      console.error('list transcriptions error:', err);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err?.message ?? 'Something went wrong',
      });
    }
  }

  async azureCreate(req: Request, res: Response) {
    try {
      const { audioUrl, language } = req.body ?? {};
      if (!audioUrl || typeof audioUrl !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Invalid request',
          error: 'audioUrl is required',
        });
      }

      const lang = typeof language === 'string' ? language : 'en-US';

      const result = await transcriptionService.transcribeAzure(audioUrl, lang);

      return res.status(201).json({
        success: true,
        message: 'Azure transcription successful',
        data: { transcription: result.text },
      });
    } catch (err: any) {
      console.error('azure transcription error:', err?.message ?? err);

      return res.status(500).json({
        success: false,
        message: 'Azure transcription failed',
        error: err?.message ?? 'Unknown error',
      });
    }
  }
}
