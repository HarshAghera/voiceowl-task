"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const transcription_routes_1 = __importDefault(require("./modules/transcription/transcription.routes"));
function createApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: "2mb" }));
    app.get("/health", (req, res) => res.json({ status: "ok" }));
    app.use("/api", transcription_routes_1.default);
    app.use((req, res) => {
        res.status(404).json({ error: "Not found" });
    });
    return app;
}
