import { Schema, model } from 'mongoose';

const transcriptionSchema = new Schema(
  {
    audioUrl: { type: String, required: true },
    transcription: { type: String, required: true },
    source: { type: String, enum: ['azure', 'other'], required: true },
  },
  {
    timestamps: true,
  },
);

// Index createdAt for range queries
transcriptionSchema.index({ createdAt: 1 });

export const TranscriptionModel = model('Transcription', transcriptionSchema);
