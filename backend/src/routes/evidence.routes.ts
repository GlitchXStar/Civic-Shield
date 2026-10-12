import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import * as evidenceController from '../controllers/evidence.controller.js';

const router = Router();

// All evidence routes require authentication
router.use(authenticate);

// Evidence upload for a case: POST /api/evidence/cases/:id
router.post('/cases/:id', upload.array('files', 10), evidenceController.uploadEvidence);

// List all evidence for a case: GET /api/evidence/cases/:id
router.get('/cases/:id', evidenceController.getCaseEvidence);

// Evidence download: GET /api/evidence/:id/download
router.get('/:id/download', evidenceController.downloadEvidence);

// Evidence details: GET /api/evidence/:id
router.get('/:id', evidenceController.getEvidenceDetails);

// Delete evidence: DELETE /api/evidence/:id
router.delete('/:id', evidenceController.deleteEvidence);

export default router;
