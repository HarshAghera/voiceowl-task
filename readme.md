# **VoiceOwl – Backend API (Node.js + TypeScript)**

A lightweight backend service that accepts audio URLs, processes mock and Azure-based transcriptions, and stores results in MongoDB. Built according to the **VoiceOwl Developer Evaluation Task**.

## Features Implemented

### **1 POST /api/transcription (Mock Transcription)**

- Accepts `{ audioUrl }`
- Mocks audio download with retry logic
- Returns dummy transcription `"transcribed text"`
- Saves `{ audioUrl, transcription, createdAt }` into MongoDB
- Returns record ID

### **2 GET /api/transcriptions (Last 30 Days Only)**

- Retrieves transcriptions created within the past 30 days
- Sorted newest => oldest

**Index Used for Performance**

```ts
db.transcriptions.createIndex({ createdAt: 1 });
```

---

## **Azure Speech-to-Text Integration**

### **POST /api/azure-transcription**

- Accepts `{ audioUrl, language }`
- Downloads audio → converts to WAV PCM 16k via ffmpeg-static
- Uses **Azure Cognitive Services Speech SDK**
- Handles:

  - Timeouts
  - Bad URLs
  - ffmpeg failures
  - Retries

- Saves Azure transcription result to MongoDB

Environment variables:

```
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=
```

---

## Tests (Jest + Supertest)

- Tests for:

  - `POST /api/transcription`
  - Missing audioUrl
  - Azure transcription (mocked)

- Uses Jest mocks to avoid real Azure calls

---

## 📁 Project Structure

```
src/
  app.ts
  server.ts
  config/
  database/
  modules/
    transcription/
      transcription.controller.ts
      transcription.service.ts
      azure-transcription.service.ts
      transcription.model.ts
      transcription.types.ts
  utils/
test/
```

---

## How to Run

Install:

```bash
npm install
```

Run:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

---

## Assumptions

- Local filesystem okay for temporary downloads
- Only WAV PCM 16k supported for Azure
- Real-time streaming not required
- Azure batch transcription out of scope but recommended for production

---

# Production Improvements

These upgrades make the system **scalable, resilient, and production-ready**.

### ✔ Switch Azure transcription to **asynchronous batch mode**

Recommended because it supports:

- Large audio files
- Better parallel processing
- Lower cost compared to continuous SDK streaming
- Works well with worker queues

### ✔ Move audio processing to **background queue (BullMQ)**

Benefits:

- API becomes non-blocking
- Heavy tasks (download, ffmpeg, Azure calls) run in workers
- Allows scaling horizontally

### ✔ Add rate limiting + input sanitization

Protects from:

- Abuse
- Bot spam
- Excessive transcription requests

Tools:

- `express-rate-limit`
- `joi` or `zod`

### ✔ Add logging + monitoring

For observability:

- **Winston** → structured logs

### ✔ Add S3 or Azure Blob Storage for audio

Instead of saving audio to temp folder:

- Upload audio to Blob/S3
- Pass the blob URL to Azure
- Reduces disk I/O load
- Works well with serverless/container deployments

---

## 📌 API Summary

### **POST /api/transcription**

Mock transcription

### **GET /api/transcriptions**

List last 30 days

### **POST /api/azure-transcription**

Azure Speech-to-Text

---
