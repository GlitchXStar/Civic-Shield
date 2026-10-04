import { Request, Response, NextFunction } from 'express';
import { CrimeReport } from '../models/CrimeReport.js';
import { PoliceProfile } from '../models/PoliceProfile.js';
import { CaseAssignment } from '../models/CaseAssignment.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { successResponse, paginatedResponse } from '../types/response.js';
import { assignCaseSchema, updateAdminProfileSchema } from '../validators/admin.validator.js';
import { CaseStatus, UserRole, AuditAction } from '../constants/index.js';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [users, officers, reports] = await Promise.all([
      User.countDocuments({ role: UserRole.CITIZEN }),
      User.countDocuments({ role: UserRole.POLICE }),
      CrimeReport.countDocuments()
    ]);

    const activeCases = await CrimeReport.countDocuments({ 
      status: { $in: [CaseStatus.SUBMITTED, CaseStatus.UNDER_REVIEW, CaseStatus.ASSIGNED, CaseStatus.UNDER_INVESTIGATION] }
    });

    const resolvedCases = await CrimeReport.countDocuments({ 
      status: { $in: [CaseStatus.RESOLVED, CaseStatus.CLOSED] }
    });

    res.json(successResponse({
      users,
      officers,
      reports,
      stats: { activeCases, resolvedCases }
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
    
    // Note: To search by user name we might need aggregation if schema is separated, 
    // but typically we can fetch users with POLICE role.
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
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const reports = await CrimeReport.find(query)
      .populate('submittedBy', 'name email')
      .populate('assignedTo', 'name email')
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
    const { id } = req.params;
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
    
    report.assignedTo = officer._id;
    if (report.status === CaseStatus.SUBMITTED || report.status === CaseStatus.UNDER_REVIEW) {
      report.status = CaseStatus.ASSIGNED;
    }
    await report.save();
    
    const assignment = await CaseAssignment.create({
      caseId: id,
      officerId: officer._id,
      assignedBy: adminId,
      assignedAt: new Date(),
    });
    
    await AuditLog.create({
      userId: adminId,
      action: isReassignment ? AuditAction.CASE_REASSIGNED : AuditAction.CASE_ASSIGNED,
      entityType: 'CrimeReport',
      entityId: id,
      metadata: { officerId: officer._id, officerName: officer.name }
    });
    
    res.json(successResponse({ report, assignment }, 'Case assigned successfully'));
  } catch (error) {
    next(error);
  }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Basic aggregation example for analytics
    const casesByCategory = await CrimeReport.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);
    
    const casesByStatus = await CrimeReport.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    
    res.json(successResponse({ casesByCategory, casesByStatus }));
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (search) {
      query.action = { $regex: search, $options: 'i' };
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
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
    if (data.firstName || data.lastName) {
      const user = await User.findById(userId);
      const currentNameParts = user!.name.split(' ');
      const newFirstName = data.firstName || currentNameParts[0];
      const newLastName = data.lastName || currentNameParts.slice(1).join(' ');
      updateData.name = `${newFirstName} ${newLastName}`.trim();
    }
    if (data.phone) updateData.phone = data.phone;
    
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });
    
    await AuditLog.create({
      userId,
      action: AuditAction.USER_UPDATED,
      entityType: 'User',
      entityId: userId,
    });
    
    res.json(successResponse({ user: updatedUser?.toJSON() }, 'Profile updated'));
  } catch (error) {
    next(error);
  }
}
