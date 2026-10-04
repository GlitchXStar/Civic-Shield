import { Request, Response, NextFunction } from 'express';
import { CrimeReport } from '../models/CrimeReport.js';
import { CaseStatusHistory } from '../models/CaseStatusHistory.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/error.middleware.js';
import { successResponse, paginatedResponse } from '../types/response.js';
import { reportCrimeSchema, updateProfileSchema } from '../validators/citizen.validator.js';
import { CaseStatus, AuditAction } from '../constants/index.js';

export async function submitReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = reportCrimeSchema.parse(req.body);
    const userId = req.user!.id;

    // Generate tracking ID (e.g. CR-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `CR-${dateStr}-${randomNum}`;

    let locationPoint;
    if (data.location.coordinates) {
      locationPoint = {
        type: 'Point',
        coordinates: [data.location.coordinates.lng, data.location.coordinates.lat],
      };
    }

    const report = await CrimeReport.create({
      trackingId,
      submittedBy: userId,
      category: data.category,
      title: `Crime Report - ${data.category}`,
      incidentDate: data.incidentDate,
      location: {
        type: 'Point',
        formattedAddress: data.location.address,
        city: data.location.city,
        state: data.location.state,
        pincode: data.location.pincode,
        coordinates: locationPoint,
      },
      description: data.description,
      contactPreference: 'EMAIL',
      status: CaseStatus.SUBMITTED,
    });

    await CaseStatusHistory.create({
      caseId: report._id,
      status: CaseStatus.SUBMITTED,
      changedBy: userId,
      remarks: 'Report submitted by citizen.',
    });

    await AuditLog.create({
      userId,
      action: AuditAction.REPORT_CREATED,
      entityType: 'CrimeReport',
      entityId: report._id,
      metadata: { trackingId },
    });

    res.status(201).json(successResponse({ report }, 'Report submitted successfully'));
  } catch (error) {
    next(error);
  }
}

export async function getMyReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { status, search, page = 1, limit = 10 } = req.query;

    const query: any = { submittedBy: userId };
    
    if (status) {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const reports = await CrimeReport.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
      
    const total = await CrimeReport.countDocuments(query);

    res.json(paginatedResponse(reports, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }));
  } catch (error) {
    next(error);
  }
}

export async function getReportDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const report = await CrimeReport.findOne({ _id: id, submittedBy: userId });
    
    if (!report) {
      throw new AppError('Report not found or access denied', 404, 'NOT_FOUND');
    }

    res.json(successResponse({ report }));
  } catch (error) {
    next(error);
  }
}

export async function getReportTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verify ownership
    const report = await CrimeReport.findOne({ _id: id, submittedBy: userId });
    if (!report) {
      throw new AppError('Report not found or access denied', 404, 'NOT_FOUND');
    }

    const timeline = await CaseStatusHistory.find({ caseId: id }).sort({ createdAt: 1 })
      .populate('changedBy', 'name role');

    res.json(successResponse({ timeline }));
  } catch (error) {
    next(error);
  }
}

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
    res.json(successResponse({ notifications }));
  } catch (error) {
    next(error);
  }
}

export async function readNotification(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }

    res.json(successResponse({ success: true }));
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }
    res.json(successResponse({ user: user.toJSON() }));
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const data = updateProfileSchema.parse(req.body);

    const updateData: any = {};
    if (data.firstName || data.lastName) {
      const user = await User.findById(userId);
      const currentNameParts = user!.name.split(' ');
      const newFirstName = data.firstName || currentNameParts[0];
      const newLastName = data.lastName || currentNameParts.slice(1).join(' ');
      updateData.name = `${newFirstName} ${newLastName}`.trim();
    }
    if (data.phone) updateData.phone = data.phone;
    if (data.address) updateData.address = data.address;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    if (!updatedUser) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    await AuditLog.create({
      userId,
      action: AuditAction.USER_UPDATED,
      entityType: 'User',
      entityId: userId,
      details: 'Updated profile information'
    });

    res.json(successResponse({ user: updatedUser.toJSON() }, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
}
