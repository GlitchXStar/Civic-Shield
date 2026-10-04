import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { errorResponse } from '../types/response.js';
import { AppError } from './error.middleware.js';
import { UserRoleType } from '../constants/index.js';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRoleType;
        name: string;
      };
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
  role: UserRoleType;
}

/**
 * Authentication middleware — verifies JWT token
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Authentication required. Please provide a valid token.', 401, 'UNAUTHORIZED');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication required. Please provide a valid token.', 401, 'UNAUTHORIZED');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new AppError('User associated with this token no longer exists.', 401, 'UNAUTHORIZED');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Your account has been suspended or deactivated.', 403, 'ACCOUNT_SUSPENDED');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role as UserRoleType,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid or expired token.', 401, 'INVALID_TOKEN'));
      return;
    }
    next(error);
  }
}

/**
 * Authorization middleware — checks user role
 */
export function authorize(...roles: UserRoleType[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(
        new AppError(
          'You do not have permission to access this resource.',
          403,
          'FORBIDDEN'
        )
      );
      return;
    }

    next();
  };
}
