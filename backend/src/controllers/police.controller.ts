import { Request, Response, NextFunction } from 'express';
import { CrimeReport } from '../models/CrimeReport.js';
import { PoliceProfile } from '../models/PoliceProfile.js';
import { InvestigationNote } from '../models/InvestigationNote.js';
import { CaseStatusHistory } from '../models/CaseStatusHistory.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { successResponse, paginatedResponse } from '../types/response.js';
import { updateStatusSchema, addNoteSchema, updatePoliceProfileSchema } from '../validators/police.validator.js';
import { CaseStatus, AuditAction, UserRole, NotificationType, isValidStatusTransition } from '../constants/index.js';
import { logger } from '../utils/logger.js';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    
    const [newReports, assignedCases, recentReports] = await Promise.all([
      CrimeReport.countDocuments({ status: { $in: [CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW] } }),
      CrimeReport.countDocuments({ assignedTo: userId, status: { $ne: CaseStatus.CLOSED } }),
      CrimeReport.find({ assignedTo: userId }).sort({ updatedAt: -1 }).limit(10)
    ]);

    const markers = recentReports
      .filter((r) => r.location?.coordinates && r.location.coordinates.length === 2)
      .map((r) => ({
        id: r.trackingId,
        position: [r.location.coordinates[1], r.location.coordinates[0]], // [lat, lng]
        title: `${r.trackingId} · ${r.status}`,
        description: r.title,
        status: r.status,
      }));

    res.json(successResponse({
      newReports,
      assignedCases,
      reports: recentReports,
      markers,
    }));
  } catch (error) {
    next(error);
  }
}

export async function getNewReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { priority, search, page = 1, limit = 10 } = req.query;

    const query: any = { 
      status: { $in: [CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW] } 
    };
    
    if (priority && priority !== 'All priorities') {
      query.priority = String(priority).toUpperCase();
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
      .populate('submittedBy', 'name phone email')
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

export async function getAssignedCases(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const cases = await CrimeReport.find({ assignedTo: userId })
      .populate('submittedBy', 'name phone email')
      .sort({ updatedAt: -1 });
    res.json(successResponse({ cases }));
  } catch (error) {
    next(error);
  }
}

export async function getCaseDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    const report = await CrimeReport.findById(id).populate('submittedBy', 'name email phone');
    
    if (!report) {
      throw new AppError('Case not found', 404, 'NOT_FOUND');
    }

    // BOLA authorization check
    const isAssigned = report.assignedTo && report.assignedTo.toString() === userId;
    const isAvailableReview = !report.assignedTo && (report.status === CaseStatus.SUBMITTED || report.status === CaseStatus.UNDER_REVIEW);
    const isAdmin = req.user!.role === UserRole.ADMIN;

    if (!isAssigned && !isAvailableReview && !isAdmin) {
      throw new AppError('Access denied. You are not assigned to this case.', 403, 'FORBIDDEN');
    }

    res.json(successResponse({ report }));
  } catch (error) {
    next(error);
  }
}

export async function getInvestigation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    
    const report = await CrimeReport.findById(id);
    if (!report) {
      throw new AppError('Case not found', 404, 'NOT_FOUND');
    }

    // BOLA authorization check
    const isAssigned = report.assignedTo && report.assignedTo.toString() === userId;
    const isAdmin = req.user!.role === UserRole.ADMIN;

    if (!isAssigned && !isAdmin) {
      throw new AppError('Access denied. Only the assigned officer can view investigation notes.', 403, 'FORBIDDEN');
    }

    const notes = await InvestigationNote.find({ crimeReport: id })
      .populate('author', 'name role')
      .sort({ createdAt: -1 });

    res.json(successResponse({ notes }));
  } catch (error) {
    next(error);
  }
}

export async function addInvestigationNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    const data = addNoteSchema.parse(req.body);

    const report = await CrimeReport.findById(id);
    if (!report) {
      throw new AppError('Case not found', 404, 'NOT_FOUND');
    }

    // BOLA authorization check
    const isAssigned = report.assignedTo && report.assignedTo.toString() === userId;
    const isAdmin = req.user!.role === UserRole.ADMIN;

    if (!isAssigned && !isAdmin) {
      throw new AppError('Access denied. Only the assigned officer can add investigation notes.', 403, 'FORBIDDEN');
    }

    const note = await InvestigationNote.create({
      crimeReport: id,
      author: userId,
      content: data.note,
      isInternalOnly: true,
    });

    await AuditLog.create({
      user: userId,
      action: AuditAction.INVESTIGATION_NOTE_CREATED,
      resource: 'InvestigationNote',
      resourceId: note._id.toString(),
      ipAddress: req.ip,
      details: { caseId: id },
    });
    
    logger.police(`Officer ${userId} added an investigation note to Case ${id}`, { reqId: req.id as string, user: userId, case: id });

    res.status(201).json(successResponse({ note }));
  } catch (error) {
    next(error);
  }
}

export async function updateCaseStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    const data = updateStatusSchema.parse(req.body);

    const report = await CrimeReport.findById(id);
    if (!report) {
      throw new AppError('Case not found', 404, 'NOT_FOUND');
    }

    // BOLA authorization check
    const isAssigned = report.assignedTo && report.assignedTo.toString() === userId;
    const isAdmin = req.user!.role === UserRole.ADMIN;

    if (!isAssigned && !isAdmin) {
      throw new AppError('Access denied. Only the assigned officer can update case status.', 403, 'FORBIDDEN');
    }

    // State machine check
    if (!isValidStatusTransition(report.status, data.status)) {
      throw new AppError(`Invalid status transition from ${report.status} to ${data.status}.`, 400, 'INVALID_TRANSITION');
    }

    const prevStatus = report.status;
    report.status = data.status;
    await report.save();

    const history = await CaseStatusHistory.create({
      crimeReport: id,
      changedBy: userId,
      previousStatus: prevStatus,
      newStatus: data.status,
      reason: data.remarks || 'Status update by investigating officer',
      changedAt: new Date(),
    });

    await AuditLog.create({
      user: userId,
      action: AuditAction.STATUS_CHANGED,
      resource: 'CrimeReport',
      resourceId: id,
      ipAddress: req.ip,
      details: { previousStatus: prevStatus, newStatus: data.status, remarks: data.remarks }
    });

    // Notify citizen
    if (report.submittedBy) {
      await Notification.create({
        recipient: report.submittedBy,
        title: `Case Status Update: ${report.trackingId}`,
        message: `Your report status has been updated to ${data.status}.`,
        type: NotificationType.STATUS_CHANGED,
        relatedReport: report._id,
      });
    }
    
    logger.caseStatusChange(id, String(prevStatus), data.status, req.user?.name || userId, 'Police');
    logger.police(`Officer ${userId} updated Case ${id} status to ${data.status}`, { reqId: req.id as string, user: userId, case: id });

    res.json(successResponse({ history }, 'Status updated successfully'));
  } catch (error) {
    next(error);
  }
}

export async function exportReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const reports = await CrimeReport.find().limit(100).sort({ createdAt: -1 });
    res.json(successResponse({ reports }));
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId);
    const profile = await PoliceProfile.findOne({ user: userId });

    if (!user) {
      throw new AppError('User not found', 404, 'NOT_FOUND');
    }

    res.json(successResponse({ user: user.toJSON(), profile }));
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const data = updatePoliceProfileSchema.parse(req.body);

    // Update User
    const updateUserData: any = {};
    if (data.name) {
      updateUserData.name = data.name.trim();
    } else if (data.firstName || data.lastName) {
      const user = await User.findById(userId);
      const currentNameParts = (user?.name || '').split(' ');
      const newFirstName = data.firstName || currentNameParts[0] || '';
      const newLastName = data.lastName || currentNameParts.slice(1).join(' ') || '';
      updateUserData.name = `${newFirstName} ${newLastName}`.trim();
    }
    if (data.phone) updateUserData.phone = data.phone;
    if (Object.keys(updateUserData).length > 0) {
      await User.findByIdAndUpdate(userId, updateUserData);
    }

    // Update Police Profile
    let profile = await PoliceProfile.findOne({ user: userId });
    const stationName = data.stationName || data.station;
    if (profile) {
      if (data.badgeNumber) profile.badgeNumber = data.badgeNumber;
      if (data.department) profile.department = data.department;
      if (stationName) profile.stationName = stationName;
      if (data.rank) profile.rank = data.rank;
      await profile.save();
    } else {
      profile = await PoliceProfile.create({
        user: userId,
        badgeNumber: data.badgeNumber || 'POL-' + Math.floor(1000 + Math.random() * 9000),
        department: data.department || 'General Investigation',
        stationName: stationName || 'Central Police Station',
        rank: data.rank || 'Officer',
      });
    }

    const updatedUser = await User.findById(userId);

    await AuditLog.create({
      user: userId,
      action: AuditAction.OFFICER_UPDATED,
      resource: 'PoliceProfile',
      resourceId: profile._id.toString(),
      ipAddress: req.ip,
      details: { message: 'Officer updated profile' }
    });
    
    logger.police(`Officer ${userId} updated their profile`, { reqId: req.id as string, user: userId });

    res.json(successResponse({ user: updatedUser?.toJSON(), profile }, 'Profile updated'));
  } catch (error) {
    next(error);
  }
}
