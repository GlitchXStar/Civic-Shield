import { Request, Response, NextFunction } from 'express';
import { Evidence } from '../models/Evidence.js';
import { CrimeReport } from '../models/CrimeReport.js';
import { AuditLog } from '../models/AuditLog.js';
import { AppError } from '../middleware/error.middleware.js';
import { successResponse } from '../types/response.js';
import { AuditAction, UserRole } from '../constants/index.js';
import fs from 'fs';
import path from 'path';

export async function uploadEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
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

    const files = req.files as Express.Multer.File[];
    const uploadedEvidence = [];

    for (const file of files) {
      const evidence = await Evidence.create({
        crimeReport: id,
        uploadedBy: userId,
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`, // In production, this would be an S3 URL
        fileType: getFileType(file.mimetype),
        fileSize: file.size,
        mimeType: file.mimetype,
        description: req.body.description || '',
      });

      uploadedEvidence.push(evidence);
    }

    await AuditLog.create({
      userId,
      action: AuditAction.EVIDENCE_UPLOADED,
      entityType: 'Evidence',
      entityId: id, // Linking to the case
      details: `Uploaded ${files.length} files.`
    });

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

export async function getEvidenceDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
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

export async function deleteEvidence(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
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
    const filePath = path.join(process.cwd(), evidence.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Evidence.findByIdAndDelete(id);

    await AuditLog.create({
      userId,
      action: AuditAction.EVIDENCE_DELETED,
      entityType: 'Evidence',
      entityId: id,
    });

    res.json(successResponse({ success: true }, 'Evidence deleted successfully'));
  } catch (error) {
    next(error);
  }
}
