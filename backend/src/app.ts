import express from "express";
import transcriptionRoutes from "./modules/transcription/transcription.routes";

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "2mb" }));
  app.get("/health", (req, res) => res.json({ status: "ok" }));

  app.use("/api", transcriptionRoutes);

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}
