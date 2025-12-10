import { Router } from 'express';
import { TranscriptionController } from './transcription.controller';

const router = Router();
const ctrl = new TranscriptionController();

router.post('/transcription', (req, res) => ctrl.create(req, res));
router.get('/transcriptions', (req, res) => ctrl.list(req, res));
router.post('/azure-transcription', (req, res) => ctrl.azureCreate(req, res));

export default router;
