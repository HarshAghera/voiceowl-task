// test/transcription.test.ts
// @ts-nocheck
import request from 'supertest';

// --- Mock the TranscriptionService BEFORE importing the app so controller uses the mock ---
jest.mock('../src/modules/transcription/transcription.service', () => {
  return {
    TranscriptionService: jest.fn().mockImplementation(() => ({
      // create returns a "document" with _id
      create: async (audioUrl: string) => {
        return { _id: 'mocked-id-123' };
      },
      // list returns an array
      list: async () => {
        return [
          {
            _id: 'mocked-id-123',
            audioUrl: 'https://example.com/a.mp3',
            transcription: 'transcribed text',
            createdAt: new Date(),
          },
        ];
      },
      // azure transcription returns a simple text
      transcribeAzure: async (audioUrl: string, language = 'en-US') => {
        return { text: 'mocked azure transcription' };
      },
    })),
  };
});

// Now import app and DB helpers
import { createApp } from '../src/app';
import { connectDB, disconnectDB } from '../src/database/mongoose';

const app = createApp();

beforeAll(async () => {
  // connect to test DB (in-memory or configured test mongo)
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('POST /api/transcription', () => {
  it('should create a transcription and return an id', async () => {
    const res = await request(app)
      .post('/api/transcription')
      .send({
        audioUrl:
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      })
      .expect(201);

    // unified response format: success/message/data
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('id');
    expect(typeof res.body.data.id).toBe('string');
  });

  it('should return 400 when audioUrl is missing', async () => {
    const res = await request(app)
      .post('/api/transcription')
      .send({})
      .expect(400);

    // unified error response format
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(typeof res.body.error).toBe('string');
  });
});

describe('POST /api/azure-transcription', () => {
  it('should return an azure transcription in standard format', async () => {
    const res = await request(app)
      .post('/api/azure-transcription')
      .send({
        audioUrl:
          'https://dare.wisc.edu/wp-content/uploads/sites/1051/2008/04/Arthur.mp3',
        language: 'en-US',
      })
      .expect(201);

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('transcription');
    expect(typeof res.body.data.transcription).toBe('string');
    expect(res.body.data.transcription).toBe('mocked azure transcription');
  });

  it('should return 400 for missing audioUrl on azure endpoint', async () => {
    const res = await request(app)
      .post('/api/azure-transcription')
      .send({ language: 'en-US' })
      .expect(400);

    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
  });
});
