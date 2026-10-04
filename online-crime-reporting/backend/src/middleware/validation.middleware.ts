import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { errorResponse } from '../types/response.js';

/**
 * Validation middleware — validates request body against a Zod schema
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || 'input';
          if (!errors[path]) errors[path] = [];
          errors[path].push(issue.message);
        }
        res.status(400).json(
          errorResponse('Validation failed', 'VALIDATION_ERROR', errors)
        );
        return;
      }
      next(error);
    }
  };
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.') || 'query';
          if (!errors[path]) errors[path] = [];
          errors[path].push(issue.message);
        }
        res.status(400).json(
          errorResponse('Invalid query parameters', 'VALIDATION_ERROR', errors)
        );
        return;
      }
      next(error);
    }
  };
}
