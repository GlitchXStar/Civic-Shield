import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import * as evidenceController from '../controllers/evidence.controller.js';

const router = Router();

// All evidence routes require authentication
router.use(authenticate);

// We need to attach the upload route to /reports/:id/evidence conceptually,
// but since this file is for evidence, let's export a specific reports-evidence router
// OR we can put upload on the evidence router: POST /api/evidence/cases/:id
router.post('/cases/:id', upload.array('files', 10), evidenceController.uploadEvidence);

router.get('/:id', evidenceController.getEvidenceDetails);
router.delete('/:id', evidenceController.deleteEvidence);

export default router;
