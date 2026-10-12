import { Router, Request, Response } from 'express';
import { successResponse } from '../types/response.js';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json(
    successResponse({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }, 'Civic Shield API is running')
  );
});

export default router;
