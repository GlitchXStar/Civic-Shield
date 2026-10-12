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
import { logger } from '../utils/logger.js';

export async function submitReport(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = reportCrimeSchema.parse(req.body);
    const userId = req.user!.id;

    // Generate tracking ID (e.g. CR-YYYYMMDD-XXXX)
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const trackingId = `CR-${dateStr}-${randomNum}`;

    let coordinates: [number, number] = [72.8777, 19.0760]; // default Mumbai [lng, lat]
    if (data.location?.coordinates) {
      coordinates = [data.location.coordinates.lng, data.location.coordinates.lat];
    }

    const report = await CrimeReport.create({
      trackingId,
      submittedBy: userId,
      category: data.category,
      title: data.title || `Crime Report - ${data.category}`,
      incidentDate: data.incidentDate,
      location: {
        type: 'Point',
        coordinates,
        formattedAddress: data.location?.address || 'Incident Location',
        city: data.location?.city || 'Mumbai',
        state: data.location?.state || 'Maharashtra',
        pincode: data.location?.pincode || '400001',
      },
      description: data.description,
      contactPreference: data.contactPreference || 'EMAIL',
      status: CaseStatus.SUBMITTED,
    });

    await CaseStatusHistory.create({
      crimeReport: report._id,
      changedBy: userId,
      previousStatus: CaseStatus.SUBMITTED,
      newStatus: CaseStatus.SUBMITTED,
      reason: 'Report submitted by citizen.',
      changedAt: new Date(),
    });

    await AuditLog.create({
      user: userId,
      action: AuditAction.REPORT_CREATED,
      resource: 'CrimeReport',
      resourceId: report._id.toString(),
      ipAddress: req.ip,
      details: { trackingId },
    });

    logger.citizen('Crime report submitted', {
      reqId: req.id,
      user: userId,
      Case: trackingId,
      Category: data.category
    });

    res.status(201).json(successResponse({ report }, 'Report submitted successfully'));
  } catch (error) {
    next(error);
  }
}

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    const [totalReports, activeCases, resolvedCases, recentReports] = await Promise.all([
      CrimeReport.countDocuments({ submittedBy: userId }),
      CrimeReport.countDocuments({
        submittedBy: userId,
        status: { $in: [CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW, CaseStatus.ASSIGNED, CaseStatus.UNDER_INVESTIGATION] }
      }),
      CrimeReport.countDocuments({
        submittedBy: userId,
        status: { $in: [CaseStatus.RESOLVED, CaseStatus.CLOSED] }
      }),
      CrimeReport.find({ submittedBy: userId }).sort({ createdAt: -1 }).limit(5)
    ]);

    const markers = recentReports
      .filter((r) => r.location?.coordinates && r.location.coordinates.length === 2)
      .map((r) => ({
        id: r.trackingId,
        position: [r.location.coordinates[1], r.location.coordinates[0]], // [lat, lng] for Leaflet
        title: `${r.trackingId} · ${r.category}`,
        description: r.title,
        status: r.status,
      }));

    res.json(successResponse({
      totalReports,
      activeCases,
      resolvedCases,
      recentReports,
      markers,
    }));
  } catch (error) {
    next(error);
  }
}

export async function getMyReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const { status, search, page = 1, limit = 10 } = req.query;

    logger.citizen('Viewing own reports', { reqId: req.id, user: userId });

    const query: any = { submittedBy: userId };
    
    if (status && status !== 'All statuses') {
      const normalizedStatus = String(status).toUpperCase().replace(/\s+/g, '_');
      query.status = normalizedStatus;
    }
    
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
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

    logger.citizen('Viewing case', { reqId: req.id, user: userId, Case: report.trackingId });

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

    const timeline = await CaseStatusHistory.find({ crimeReport: id })
      .sort({ createdAt: 1 })
      .populate('changedBy', 'name role');

    res.json(successResponse({ timeline }));
  } catch (error) {
    next(error);
  }
}

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(50);
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
      { _id: id, recipient: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found', 404, 'NOT_FOUND');
    }

    logger.notification('Marked as read', { reqId: req.id, user: userId, Notification: id });

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
    if (data.name) {
      updateData.name = data.name.trim();
    } else if (data.firstName || data.lastName) {
      const user = await User.findById(userId);
      const currentNameParts = (user?.name || '').split(' ');
      const newFirstName = data.firstName || currentNameParts[0] || '';
      const newLastName = data.lastName || currentNameParts.slice(1).join(' ') || '';
      updateData.name = `${newFirstName} ${newLastName}`.trim();
    }
    if (data.phone) updateData.phone = data.phone;
    if (data.address) updateData.address = data.address;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    if (!updatedUser) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    await AuditLog.create({
      user: userId,
      action: AuditAction.USER_UPDATED,
      resource: 'User',
      resourceId: userId.toString(),
      ipAddress: req.ip,
      details: { message: 'Updated profile information' },
    });

    logger.citizen('Profile updated', { reqId: req.id, user: userId });

    res.json(successResponse({ user: updatedUser.toJSON() }, 'Profile updated successfully'));
  } catch (error) {
    next(error);
  }
}
