import { createApp } from "./app";
import { connectDB, disconnectDB } from "./database/mongoose";
import { PORT } from "./config/env";

const app = createApp();

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    disconnectDB();
    process.exit(1);
  }
}

start();
