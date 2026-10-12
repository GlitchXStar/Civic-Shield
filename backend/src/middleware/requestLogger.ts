import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import onHeaders from 'on-headers';
import { logger } from '../utils/logger.js';

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Generates a shorter request ID from a UUID (first 6 chars) + random char
 */
function generateReqId() {
  return 'REQ-' + uuidv4().substring(0, 6).toUpperCase();
}

/**
 * Middleware to log incoming requests and exact duration
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  // 1. Assign Request ID
  req.id = generateReqId();

  // 2. Set response header
  res.setHeader('X-Request-ID', req.id);

  // 3. Mark start time
  const start = Date.now();

  // 4. Log incoming entry
  logger.reqEntry(req.id, req.method, req.originalUrl || req.url, req.body);

  // 5. Intercept response to log exit
  onHeaders(res, () => {
    const duration = Date.now() - start;
    
    // Defer exit log slightly so it appears after synchronous actions
    process.nextTick(() => {
      logger.reqExit(req.id!, req.method, req.originalUrl || req.url, res.statusCode, duration);
    });
  });

  next();
}
