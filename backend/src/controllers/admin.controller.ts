import { Request, Response, NextFunction } from 'express';
import { CrimeReport } from '../models/CrimeReport.js';
import { PoliceProfile } from '../models/PoliceProfile.js';
import { CaseAssignment } from '../models/CaseAssignment.js';
import { CaseStatusHistory } from '../models/CaseStatusHistory.js';
import { Notification } from '../models/Notification.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { successResponse, paginatedResponse } from '../types/response.js';
import { assignCaseSchema, updateAdminProfileSchema, createUserSchema } from '../validators/admin.validator.js';
import { CaseStatus, UserRole, AuditAction, PoliceStatus, UserStatus, NotificationType } from '../constants/index.js';
import { hashPassword } from '../utils/auth.utils.js';
import { logger } from '../utils/logger.js';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [users, officers, reports, recentReports] = await Promise.all([
      User.countDocuments({ role: UserRole.CITIZEN }),
      User.countDocuments({ role: UserRole.POLICE }),
      CrimeReport.countDocuments(),
      CrimeReport.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const activeCases = await CrimeReport.countDocuments({ 
      status: { $in: [CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW, CaseStatus.ASSIGNED, CaseStatus.UNDER_INVESTIGATION] }
    });

    const resolvedCases = await CrimeReport.countDocuments({ 
      status: { $in: [CaseStatus.RESOLVED, CaseStatus.CLOSED] }
    });

    const markers = recentReports
      .filter((r) => r.location?.coordinates && r.location.coordinates.length === 2)
      .map((r) => ({
        id: r.trackingId,
        position: [r.location.coordinates[1], r.location.coordinates[0]], // [lat, lng]
        title: `${r.trackingId} · ${r.category}`,
        description: r.title,
        status: r.status,
      }));

    res.json(successResponse({
      users,
      officers,
      reports,
      stats: { activeCases, resolvedCases },
      recentReports,
      markers,
    }));
  } catch (error) {
    next(error);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const query: any = { role: UserRole.CITIZEN };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    
    res.json(paginatedResponse(users, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }));
  } catch (error) {
    next(error);
  }
}

export async function getOfficers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    const query: any = { role: UserRole.POLICE };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(query).skip(skip).limit(Number(limit)).sort({ createdAt: -1 });
    const total = await User.countDocuments(query);
    
    const userIds = users.map(u => u._id);
    const profiles = await PoliceProfile.find({ user: { $in: userIds } });
    
    // Combine user and profile data
    const officers = users.map(u => {
      const p = profiles.find(p => p.user.toString() === u._id.toString());
      return { ...u.toJSON(), profile: p };
    });
    
    res.json(paginatedResponse(officers, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }));
  } catch (error) {
    next(error);
  }
}

export async function getAllReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    
    const query: any = {};
    if (status && status !== 'All statuses') {
      query.status = String(status).toUpperCase().replace(/\s+/g, '_');
    }
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const reports = await CrimeReport.find(query)
      .populate('submittedBy', 'name email phone')
      .populate('assignedTo', 'name email badgeNumber')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
      
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

export async function getUnassignedCases(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cases = await CrimeReport.find({
      status: { $in: [CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW] },
      assignedTo: null
    }).sort({ createdAt: -1 });
    
    res.json(successResponse({ cases }));
  } catch (error) {
    next(error);
  }
}

export async function assignCase(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const adminId = req.user!.id;
    const data = assignCaseSchema.parse(req.body);
    
    const report = await CrimeReport.findById(id);
    if (!report) {
      throw new AppError('Case not found', 404, 'NOT_FOUND');
    }
    
    const officer = await User.findOne({ _id: data.officerId, role: UserRole.POLICE });
    if (!officer) {
      throw new AppError('Officer not found', 404, 'NOT_FOUND');
    }
    
    const isReassignment = !!report.assignedTo;
    const prevOfficerId = report.assignedTo ? report.assignedTo.toString() : 'None';
    
    report.assignedTo = officer._id;
    const prevStatus = report.status;
    if (report.status === CaseStatus.SUBMITTED || report.status === CaseStatus.UNDER_REVIEW) {
      report.status = CaseStatus.ASSIGNED;
    }
    await report.save();
    
    const assignment = await CaseAssignment.create({
      crimeReport: id,
      assignedTo: officer._id,
      assignedBy: adminId,
      assignedAt: new Date(),
      status: 'ACTIVE',
      notes: `Assigned to ${officer.name}`,
    });

    await CaseStatusHistory.create({
      crimeReport: id,
      changedBy: adminId,
      previousStatus: prevStatus,
      newStatus: report.status,
      reason: `Case assigned to Officer ${officer.name} by administrator`,
      changedAt: new Date(),
    });

    await PoliceProfile.updateOne({ user: officer._id }, { $inc: { casesAssignedCount: 1 } });
    
    await AuditLog.create({
      user: adminId,
      action: isReassignment ? AuditAction.CASE_REASSIGNED : AuditAction.CASE_ASSIGNED,
      resource: 'CrimeReport',
      resourceId: id,
      ipAddress: req.ip,
      details: { officerId: officer._id.toString(), officerName: officer.name }
    });

    // Notify citizen
    if (report.submittedBy) {
      await Notification.create({
        recipient: report.submittedBy,
        title: `Case Assigned: ${report.trackingId}`,
        message: `Your report "${report.title}" has been assigned to Officer ${officer.name}.`,
        type: NotificationType.CASE_ASSIGNED,
        relatedReport: report._id,
      });
    }

    // Notify officer
    await Notification.create({
      recipient: officer._id,
      title: `New Case Assigned: ${report.trackingId}`,
      message: `You have been assigned to investigate report "${report.title}".`,
      type: NotificationType.CASE_ASSIGNED,
      relatedReport: report._id,
    });
    
    if (isReassignment) {
      logger.caseReassignment(id, prevOfficerId, officer._id.toString(), req.user?.name || adminId);
    } else {
      logger.caseAssignment(id, officer._id.toString(), req.user?.name || adminId);
    }
    logger.admin(`Case ${id} ${isReassignment ? 'reassigned' : 'assigned'} to Officer ${officer.name} by Admin ${adminId}`, { reqId: req.id as string, user: adminId, case: id });
    
    res.json(successResponse({ report, assignment }, 'Case assigned successfully'));
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const adminId = req.user!.id;
    const data = createUserSchema.parse(req.body);

    const existing = await User.findOne({ email: data.email });
    if (existing) {
      throw new AppError('Email is already registered.', 409, 'EMAIL_IN_USE');
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await User.create({
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      passwordHash: hashedPassword,
      role: data.role as any,
      status: UserStatus.ACTIVE,
    });

    if (data.role === UserRole.POLICE) {
      await PoliceProfile.create({
        user: user._id,
        badgeNumber: data.badgeNumber || 'POL-' + Math.floor(1000 + Math.random() * 9000),
        rank: data.rank || 'Officer',
        department: data.department || 'General Operations',
        stationName: data.stationName || 'Central Station',
        status: PoliceStatus.AVAILABLE,
      });
    }

    await AuditLog.create({
      user: adminId,
      action: AuditAction.REGISTER,
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
      details: { createdRole: data.role, email: data.email },
    });

    res.status(201).json(successResponse({ user: user.toJSON() }, 'User created successfully'));
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [casesByCategory, casesByStatus, totalReports, resolvedReports] = await Promise.all([
      CrimeReport.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } }
      ]),
      CrimeReport.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      CrimeReport.countDocuments(),
      CrimeReport.countDocuments({ status: { $in: [CaseStatus.RESOLVED, CaseStatus.CLOSED] } }),
    ]);

    const resolutionRate = totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;
    
    res.json(successResponse({
      casesByCategory,
      casesByStatus,
      totalReports,
      resolvedReports,
      resolutionRate,
    }));
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: 'i' } },
        { resource: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
      
    const total = await AuditLog.countDocuments(query);
    
    res.json(paginatedResponse(logs, {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit))
    }));
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
    const data = updateAdminProfileSchema.parse(req.body);
    
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
    
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    await AuditLog.create({
      user: userId,
      action: AuditAction.USER_UPDATED,
      resource: 'User',
      resourceId: userId.toString(),
      ipAddress: req.ip,
      details: { message: 'Admin updated profile' },
    });
    
    logger.admin(`Admin ${userId} updated their profile`, { reqId: req.id as string, user: userId });
    
    res.json(successResponse({ user: updatedUser?.toJSON() }, 'Profile updated'));
  } catch (error) {
    next(error);
  }
}
