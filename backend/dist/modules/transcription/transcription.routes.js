"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transcription_controller_1 = require("./transcription.controller");
const router = (0, express_1.Router)();
const ctrl = new transcription_controller_1.TranscriptionController();
router.post("/transcription", (req, res) => ctrl.create(req, res));
router.get("/transcriptions", (req, res) => ctrl.list(req, res));
exports.default = router;
