import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../types/response.js';
import { env } from '../config/env.js';

// Custom error class
export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, errorCode?: string) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || 'INTERNAL_ERROR';
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 404 handler
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(
    errorResponse(`Route ${req.method} ${req.originalUrl} not found`, 'NOT_FOUND')
  );
}

// Global error handler
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.message, err.errorCode));
    return;
  }

  // Mongoose Duplicate Key Error (E11000)
  if (err.name === 'MongoServerError' || (err as any).code === 11000) {
    const mongoErr = err as any;
    const field = Object.keys(mongoErr.keyValue || {})[0] || 'field';
    res.status(409).json(
      errorResponse(`A record with this ${field} already exists`, 'DUPLICATE_ENTRY')
    );
    return;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const mongooseErr = err as any;
    const errors: Record<string, string[]> = {};
    for (const key in mongooseErr.errors) {
      errors[key] = [mongooseErr.errors[key].message];
    }
    res.status(400).json(
      errorResponse('Validation failed', 'VALIDATION_ERROR', errors)
    );
    return;
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    const castErr = err as any;
    res.status(400).json(
      errorResponse(`Invalid format for field '${castErr.path}'`, 'INVALID_ID')
    );
    return;
  }

  // Multer errors
  if (err.constructor?.name === 'MulterError') {
    const multerErr = err as any;
    if (multerErr.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json(errorResponse('File size exceeds the allowed limit', 'FILE_TOO_LARGE'));
      return;
    }
    res.status(400).json(errorResponse(`Upload error: ${multerErr.message}`, 'UPLOAD_ERROR'));
    return;
  }

  // Zod validation errors
  if (err.constructor?.name === 'ZodError') {
    const zodErr = err as any;
    const errors: Record<string, string[]> = {};
    for (const issue of zodErr.issues) {
      const path = issue.path.join('.') || 'input';
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    res.status(400).json(
      errorResponse('Validation failed', 'VALIDATION_ERROR', errors)
    );
    return;
  }

  // Generic error
  console.error('Unhandled error:', err);
  res.status(500).json(
    errorResponse(
      env.isProduction ? 'An internal server error occurred' : err.message,
      'INTERNAL_ERROR'
    )
  );
}
