import { Request, Response, NextFunction } from 'express';
import { Evidence } from '../models/Evidence.js';
import { CrimeReport } from '../models/CrimeReport.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/error.middleware.js';
import { successResponse } from '../types/response.js';
import { AuditAction, UserRole, CaseStatus } from '../constants/index.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import fs from 'fs';
import path from 'path';

export async function uploadEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    const role = req.user!.role;

    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      throw new AppError('No files uploaded', 400, 'NO_FILES');
    }

    const report = await CrimeReport.findById(id);
    if (!report) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }

    // Check authorization: must be reporter or police/admin
    if (role === UserRole.CITIZEN && report.submittedBy.toString() !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    if (role === UserRole.POLICE && report.assignedTo && report.assignedTo.toString() !== userId) {
      throw new AppError('Access denied. You are not assigned to this case.', 403, 'FORBIDDEN');
    }

    const files = req.files as Express.Multer.File[];
    const uploadedEvidence = [];

    for (const file of files) {
      const evidence = await Evidence.create({
        crimeReport: id,
        uploadedBy: userId,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: getFileType(file.mimetype),
        fileSize: file.size,
        mimeType: file.mimetype,
        description: req.body.description || '',
      });

      uploadedEvidence.push(evidence);
    }

    await CrimeReport.updateOne(
      { _id: id },
      { $push: { evidenceFiles: { $each: uploadedEvidence.map((e) => e._id) } } }
    );

    await AuditLog.create({
      user: userId,
      action: AuditAction.EVIDENCE_UPLOADED,
      resource: 'Evidence',
      resourceId: id,
      ipAddress: req.ip,
      details: { filesCount: files.length },
    });
    
    logger.evidence(`Uploaded ${files.length} evidence files to Case ${id}`, { reqId: req.id as string, user: userId, case: id });

    res.status(201).json(successResponse({ evidence: uploadedEvidence }, 'Evidence uploaded successfully'));
  } catch (error) {
    next(error);
  }
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'IMAGE';
  if (mimeType.startsWith('video/')) return 'VIDEO';
  if (mimeType.startsWith('audio/')) return 'AUDIO';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'DOCUMENT';
  return 'OTHER';
}

export async function getCaseEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    const role = req.user!.role;

    const report = await CrimeReport.findById(id);
    if (!report) {
      throw new AppError('Report not found', 404, 'NOT_FOUND');
    }

    if (role === UserRole.CITIZEN && report.submittedBy.toString() !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    if (
      role === UserRole.POLICE &&
      report.assignedTo &&
      report.assignedTo.toString() !== userId &&
      report.status !== CaseStatus.SUBMITTED &&
      report.status !== CaseStatus.UNDER_REVIEW
    ) {
      throw new AppError('Access denied. You are not assigned to this case.', 403, 'FORBIDDEN');
    }

    const evidence = await Evidence.find({ crimeReport: id })
      .populate('uploadedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(successResponse({ evidence }));
  } catch (error) {
    next(error);
  }
}

export async function getEvidenceDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    const role = req.user!.role;

    const evidence = await Evidence.findById(id).populate('uploadedBy', 'name role');
    if (!evidence) {
      throw new AppError('Evidence not found', 404, 'NOT_FOUND');
    }

    if (role === UserRole.CITIZEN) {
      const report = await CrimeReport.findById(evidence.crimeReport);
      if (!report || report.submittedBy.toString() !== userId) {
        throw new AppError('Access denied', 403, 'FORBIDDEN');
      }
    }

    res.json(successResponse({ evidence }));
  } catch (error) {
    next(error);
  }
}

export async function downloadEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    const role = req.user!.role;

    const evidence = await Evidence.findById(id);
    if (!evidence) {
      throw new AppError('Evidence not found', 404, 'NOT_FOUND');
    }

    const report = await CrimeReport.findById(evidence.crimeReport);
    if (!report) {
      throw new AppError('Case associated with evidence not found', 404, 'NOT_FOUND');
    }

    if (role === UserRole.CITIZEN && report.submittedBy.toString() !== userId) {
      throw new AppError('Access denied', 403, 'FORBIDDEN');
    }

    const filename = path.basename(evidence.fileUrl);
    const filePath = path.join(env.UPLOAD_DIR, filename);

    if (!fs.existsSync(filePath)) {
      throw new AppError('Evidence file not found on server', 404, 'NOT_FOUND');
    }

    res.download(filePath, evidence.fileName);
  } catch (error) {
    next(error);
  }
}

export async function deleteEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = req.user!.id;
    const role = req.user!.role;

    const evidence = await Evidence.findById(id);
    if (!evidence) {
      throw new AppError('Evidence not found', 404, 'NOT_FOUND');
    }

    // Check auth: uploader or ADMIN
    if (role !== UserRole.ADMIN && evidence.uploadedBy.toString() !== userId) {
      throw new AppError('Access denied. You can only delete your own evidence.', 403, 'FORBIDDEN');
    }

    // Delete file from disk
    const filename = path.basename(evidence.fileUrl);
    const filePath = path.join(env.UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Evidence.findByIdAndDelete(id);
    await CrimeReport.updateOne({ _id: evidence.crimeReport }, { $pull: { evidenceFiles: id } });

    await AuditLog.create({
      user: userId,
      action: AuditAction.EVIDENCE_DELETED,
      resource: 'Evidence',
      resourceId: id,
      ipAddress: req.ip,
    });
    
    logger.evidence(`Deleted evidence ${id}`, { reqId: req.id as string, user: userId, case: evidence.crimeReport?.toString() });

    res.json(successResponse({ success: true }, 'Evidence deleted successfully'));
  } catch (error) {
    next(error);
  }
}
