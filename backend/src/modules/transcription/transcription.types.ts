export interface ITranscription {
  audioUrl: string;
  transcription: string;
  createdAt: Date;
  updatedAt: Date;
}

import { Document, Types } from "mongoose";
export interface ITranscriptionDocument extends ITranscription, Document {
  _id: Types.ObjectId;
}

export interface ITranscriptionLean extends ITranscription {
  _id: Types.ObjectId;
  __v: number;
}
