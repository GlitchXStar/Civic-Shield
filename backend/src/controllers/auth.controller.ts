import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';
import { PoliceProfile } from '../models/PoliceProfile.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/error.middleware.js';
import { successResponse } from '../types/response.js';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth.utils.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';
import { UserRole, UserRoleType, UserStatus, AuditAction } from '../constants/index.js';
import { logger } from '../utils/logger.js';
export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      throw new AppError('Email is already registered.', 409, 'EMAIL_IN_USE');
    }

    const hashedPassword = await hashPassword(data.password);

    let fullName = data.name?.trim();
    if (!fullName) {
      fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
    }
    if (!fullName) {
      fullName = 'Citizen User';
    }

    let assignedRole: UserRoleType = UserRole.CITIZEN;
    if (data.role) {
      const upperRole = data.role.toUpperCase();
      if (upperRole === 'POLICE' || upperRole === 'POLICE_OFFICER') {
        assignedRole = UserRole.POLICE;
      } else if (upperRole === 'ADMIN' || upperRole === 'ADMINISTRATOR') {
        assignedRole = UserRole.ADMIN;
      } else {
        assignedRole = UserRole.CITIZEN;
      }
    }

    const user = await User.create({
      name: fullName,
      email: data.email,
      phone: data.phone || '',
      passwordHash: hashedPassword,
      role: assignedRole,
      status: UserStatus.ACTIVE,
    });

    if (assignedRole === UserRole.POLICE) {
      const existingProfile = await PoliceProfile.findOne({ user: user._id });
      if (!existingProfile) {
        await PoliceProfile.create({
          user: user._id,
          badgeNumber: `POL-${Date.now().toString().slice(-6)}`,
          rank: 'Officer',
          department: 'General Policing',
          stationName: 'Central Police Station',
          status: 'AVAILABLE',
        });
      }
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await AuditLog.create({
      user: user._id,
      action: AuditAction.REGISTER,
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
    });

    logger.auth('User registration', {
      reqId: req.id,
      user: user._id.toString(),
      role: user.role
    });

    res.status(201).json(
      successResponse({
        token,
        user: user.toJSON(),
      }, 'Registration successful')
    );
  } catch (error) {
    if (error instanceof AppError && error.errorCode === 'EMAIL_IN_USE') {
      logger.auth('Registration failed', { reqId: req.id, Reason: error.message });
    }
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);
    logger.auth('Login attempt', { reqId: req.id, Email: data.email });

    const user = await User.findOne({ email: data.email }).select('+passwordHash');
    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError('Your account has been suspended or deactivated.', 403, 'ACCOUNT_SUSPENDED');
    }

    const isPasswordValid = await verifyPassword(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (data.role) {
      const requestedRole = data.role.toUpperCase();
      const mappedRole =
        requestedRole === 'POLICE_OFFICER' || requestedRole === 'POLICE'
          ? UserRole.POLICE
          : requestedRole === 'ADMINISTRATOR' || requestedRole === 'ADMIN'
          ? UserRole.ADMIN
          : UserRole.CITIZEN;

      if (mappedRole !== user.role) {
        const friendlyRole =
          user.role === UserRole.CITIZEN
            ? 'Citizen'
            : user.role === UserRole.POLICE
            ? 'Police Officer'
            : 'Administrator';
        throw new AppError(
          `This account is registered as a ${friendlyRole}. Please select the ${friendlyRole} role to log in.`,
          403,
          'ROLE_MISMATCH'
        );
      }
    }

    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await AuditLog.create({
      user: user._id,
      action: AuditAction.LOGIN,
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
    });

    logger.auth('Login successful', {
      reqId: req.id,
      user: user._id.toString(),
      role: user.role
    });

    res.json(
      successResponse({
        token,
        user: user.toJSON(),
      }, 'Login successful')
    );
  } catch (error) {
    if (error instanceof AppError && (error.errorCode === 'INVALID_CREDENTIALS' || error.errorCode === 'ACCOUNT_SUSPENDED')) {
      logger.auth('Login failed', { reqId: req.id, Reason: error.message });
    }
    next(error);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new AppError('User not found.', 404, 'NOT_FOUND');
    }

    logger.auth('Session restored', {
      reqId: req.id,
      user: user._id.toString(),
      role: user.role
    });

    res.json(successResponse({ user: user.toJSON() }));
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });
    
    // Always return success to prevent email enumeration
    if (user) {
      // In a real application, create a reset token and send an email
      // For this academic project, we simulate succcess.
      logger.auth(`[DEV] Password reset requested for ${data.email}. Token would be generated and emailed.`, { reqId: req.id as string, Email: data.email });
    }

    res.json(successResponse(null, 'If that email is registered, a password reset link has been sent.'));
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = resetPasswordSchema.parse(req.body);
    
    // In this academic project without mail, we would validate the token against the DB
    // Since we didn't store one in forgotPassword, we'll throw an error for now
    throw new AppError('Password reset flow requires email service configuration.', 400, 'NOT_IMPLEMENTED');

  } catch (error) {
    next(error);
  }
}
