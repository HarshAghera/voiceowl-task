// @ts-nocheck
import request from "supertest";
import { createApp } from "../src/app";
import { connectDB, disconnectDB } from "../src/database/mongoose";

const app = createApp();

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe("POST /api/transcription", () => {
  it("should create a transcription and return an id", async () => {
    const res = await request(app)
      .post("/api/transcription")
      .send({ audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" })
      .expect(201);

    expect(res.body).toHaveProperty("id");
    expect(typeof res.body.id).toBe("string");
  });

  it("should return 400 when audioUrl is missing", async () => {
    const res = await request(app).post("/api/transcription").send({}).expect(400);

    expect(res.body).toHaveProperty("error");
  });
});
