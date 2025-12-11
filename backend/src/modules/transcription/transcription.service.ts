import fs from "fs";
import os from "os";
import path from "path";
import axios from "axios";
import { retry } from "../../utils/retry";
import { TranscriptionModel } from "./transcription.model";
import { ITranscriptionDocument, ITranscriptionLean } from "./transcription.types";
import * as config from "../../config/env";

import ffmpegStatic from "ffmpeg-static";
import { spawn } from "child_process";

const AZURE_KEY = config.AZURE_SPEECH_KEY || "";
const AZURE_REGION = config.AZURE_SPEECH_REGION || "";

export class TranscriptionService {
  async create(audioUrl: string): Promise<ITranscriptionDocument> {
    await retry(() => this.mockDownload(audioUrl), 3, 300);

    const transcriptionText = "transcribed text";

    const doc = await TranscriptionModel.create({
      audioUrl,
      transcription: transcriptionText,
      source: "other"
    });

    return doc as ITranscriptionDocument;
  }

  async list(): Promise<ITranscriptionLean[]> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const results = await TranscriptionModel.find({
      createdAt: { $gte: thirtyDaysAgo }
    })
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

  private async downloadToTemp(url: string): Promise<string> {
    const tmpDir = os.tmpdir();
    const tmpName = `voiceowl_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    let ext = ".mp3";
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const foundExt = path.extname(pathname || "");
      if (foundExt) ext = foundExt;
    } catch {
      const foundExt = path.extname(url.split("?")[0] || "");
      if (foundExt) ext = foundExt;
    }

    const outPath = path.join(tmpDir, tmpName + ext);

    const writer = fs.createWriteStream(outPath);
    const res = await axios({
      url,
      method: "GET",
      responseType: "stream",
      timeout: 20000,
      maxContentLength: 200 * 1024 * 1024
    });

    await new Promise<void>((resolve, reject) => {
      res.data.pipe(writer);
      let error: Error | null = null;
      writer.on("error", (err) => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on("close", () => {
        if (!error) resolve();
      });
    });

    return outPath;
  }

  private async convertToWavPcm16k(inputPath: string): Promise<string> {
    const outPath = inputPath + ".wav";

    await fs.promises.unlink(outPath);

    const ffmpegPath = ffmpegStatic;
    if (!ffmpegPath) {
      throw new Error("ffmpeg-static did not provide a binary path. Install ffmpeg or ffmpeg-static.");
    }

    const args = ["-y", "-v", "error", "-i", inputPath, "-ac", "1", "-ar", "16000", "-sample_fmt", "s16", outPath];

    await new Promise<void>((resolve, reject) => {
      const proc = spawn(ffmpegPath as string, args, {
        stdio: ["ignore", "pipe", "pipe"]
      });

      let stderr = "";
      proc.stderr?.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      proc.on("error", (err) => {
        reject(err);
      });

      const killTimer = setTimeout(() => {
        try {
          proc.kill("SIGKILL");
        } catch {}
        reject(new Error("ffmpeg conversion timeout"));
      }, 60_000);

      proc.on("close", (code) => {
        clearTimeout(killTimer);
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`ffmpeg failed (code=${code}) stderr=${stderr}`));
        }
      });
    });

    return outPath;
  }

  async transcribeAzure(audioUrl: string, language = "en-US", retryAttempts = 3): Promise<{ text: string }> {
    if (!AZURE_KEY || !AZURE_REGION) {
      throw new Error("Azure Speech keys/config not set in environment");
    }

    return retry(
      async () => {
        const downloaded = await this.downloadToTemp(audioUrl);

        const wavPath = await this.convertToWavPcm16k(downloaded);

        const speechSdk = require("microsoft-cognitiveservices-speech-sdk");
        const fsPromises = fs.promises;
        const pushStream = speechSdk.AudioInputStream.createPushStream();

        const buffer = await fsPromises.readFile(wavPath);
        pushStream.write(buffer);
        pushStream.close();

        const audioConfig = speechSdk.AudioConfig.fromStreamInput(pushStream);

        const speechConfig = speechSdk.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION || undefined);
        speechConfig.speechRecognitionLanguage = language;

        const recognizer = new speechSdk.SpeechRecognizer(speechConfig, audioConfig);

        const result = await new Promise<{ text: string }>((resolve, reject) => {
          const sdkTimeout = setTimeout(() => {
            try {
              recognizer.close();
            } catch {}
            reject(new Error("Azure speech recognition timeout"));
          }, 60_000);

          recognizer.recognizeOnceAsync(
            (res: any) => {
              clearTimeout(sdkTimeout);
              try {
                if (!res || res.reason === undefined) {
                  reject(new Error("Empty result from speech SDK"));
                  return;
                }
                if (res.reason === speechSdk.ResultReason.RecognizedSpeech) {
                  resolve({ text: res.text });
                } else if (res.reason === speechSdk.ResultReason.NoMatch) {
                  resolve({ text: "" });
                } else {
                  reject(new Error(`Speech SDK error: ${res.errorDetails || res.reason}`));
                }
              } finally {
                try {
                  recognizer.close();
                } catch {}
              }
            },
            (err: any) => {
              clearTimeout(sdkTimeout);
              try {
                recognizer.close();
              } catch {}
              reject(err);
            }
          );
        });

        await TranscriptionModel.create({
          audioUrl,
          transcription: result.text,
          source: "azure"
        });

        try {
          await fsPromises.rm(downloaded, { force: true });
        } catch {}
        try {
          await fsPromises.rm(wavPath, { force: true });
        } catch {}

        return result;
      },
      retryAttempts,
      500
    );
  }
}
