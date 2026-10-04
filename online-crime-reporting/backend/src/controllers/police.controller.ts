import { Request, Response, NextFunction } from 'express';
import { CrimeReport } from '../models/CrimeReport.js';
import { PoliceProfile } from '../models/PoliceProfile.js';
import { InvestigationNote } from '../models/InvestigationNote.js';
import { CaseStatusHistory } from '../models/CaseStatusHistory.js';
import { AuditLog } from '../models/AuditLog.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/error.middleware.js';
import { successResponse, paginatedResponse } from '../types/response.js';
import { updateStatusSchema, addNoteSchema, updatePoliceProfileSchema } from '../validators/police.validator.js';
import { CaseStatus, AuditAction } from '../constants/index.js';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    
    const [newReports, assignedCases, recentReports] = await Promise.all([
      CrimeReport.countDocuments({ status: CaseStatus.SUBMITTED }),
      CrimeReport.countDocuments({ assignedTo: userId, status: { $ne: CaseStatus.CLOSED } }),
      CrimeReport.find({ assignedTo: userId }).sort({ updatedAt: -1 }).limit(5)
    ]);

    res.json(successResponse({
      newReports,
      assignedCases,
      reports: recentReports
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
    
    if (priority) query.priority = priority;
    
    if (search) {
      query.$or = [
        { trackingId: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
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

export async function getAssignedCases(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const cases = await CrimeReport.find({ assignedTo: userId }).sort({ updatedAt: -1 });
    res.json(successResponse({ cases }));
  } catch (error) {
    next(error);
  }
}

export async function getCaseDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const report = await CrimeReport.findById(id).populate('submittedBy', 'name email phone');
    
    if (!report) {
      throw new AppError('Case not found', 404, 'NOT_FOUND');
    }

    res.json(successResponse({ report }));
  } catch (error) {
    next(error);
  }
}

export async function getInvestigation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    
    // Ensure case exists
    const report = await CrimeReport.findById(id);
    if (!report) {
      throw new AppError('Case not found', 404, 'NOT_FOUND');
    }

    const notes = await InvestigationNote.find({ crimeReport: id })
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(successResponse({ notes }));
  } catch (error) {
    next(error);
  }
}

export async function addInvestigationNote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const data = addNoteSchema.parse(req.body);

    const report = await CrimeReport.findById(id);
    if (!report) {
      throw new AppError('Case not found', 404, 'NOT_FOUND');
    }

    const note = await InvestigationNote.create({
      crimeReport: id,
      addedBy: userId,
      content: data.note,
      isInternal: true,
    });

    await AuditLog.create({
      userId,
      action: AuditAction.INVESTIGATION_NOTE_CREATED,
      entityType: 'InvestigationNote',
      entityId: note._id,
      metadata: { caseId: id }
    });

    res.status(201).json(successResponse({ note }));
  } catch (error) {
    next(error);
  }
}

export async function updateCaseStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const data = updateStatusSchema.parse(req.body);

    const report = await CrimeReport.findById(id);
    if (!report) {
      throw new AppError('Case not found', 404, 'NOT_FOUND');
    }

    report.status = data.status;
    await report.save();

    const history = await CaseStatusHistory.create({
      caseId: id,
      status: data.status,
      changedBy: userId,
      remarks: data.remarks,
    });

    await AuditLog.create({
      userId,
      action: AuditAction.STATUS_CHANGED,
      entityType: 'CrimeReport',
      entityId: id,
      metadata: { newStatus: data.status, remarks: data.remarks }
    });

    res.json(successResponse({ history }, 'Status updated successfully'));
  } catch (error) {
    next(error);
  }
}

export async function exportReports(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Basic export implementation - just returns JSON of recent reports for now
    // A robust system would generate and send a PDF or CSV
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
    if (data.firstName || data.lastName || data.phone) {
      const user = await User.findById(userId);
      const updateData: any = {};
      if (data.firstName || data.lastName) {
        const currentNameParts = user!.name.split(' ');
        const newFirstName = data.firstName || currentNameParts[0];
        const newLastName = data.lastName || currentNameParts.slice(1).join(' ');
        updateData.name = `${newFirstName} ${newLastName}`.trim();
      }
      if (data.phone) updateData.phone = data.phone;
      await User.findByIdAndUpdate(userId, updateData);
    }

    // Update Police Profile
    let profile = await PoliceProfile.findOne({ user: userId });
    if (profile) {
      if (data.badgeNumber) profile.badgeNumber = data.badgeNumber;
      if (data.department) profile.department = data.department;
      await profile.save();
    } else {
      profile = await PoliceProfile.create({
        user: userId,
        badgeNumber: data.badgeNumber || 'N/A',
        department: data.department || 'General',
        stationName: 'TBD', // Required in schema
        rank: 'Officer',
      });
    }

    const updatedUser = await User.findById(userId);

    await AuditLog.create({
      userId,
      action: AuditAction.OFFICER_UPDATED,
      entityType: 'PoliceProfile',
      entityId: profile._id,
    });

    res.json(successResponse({ user: updatedUser?.toJSON(), profile }, 'Profile updated'));
  } catch (error) {
    next(error);
  }
}
