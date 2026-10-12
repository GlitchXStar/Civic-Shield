import { z } from 'zod';
import { CaseStatus } from '../constants/index.js';

export const updateStatusSchema = z.object({
  status: z.string().transform((val) => {
    const normalized = val.toUpperCase().trim().replace(/[\s-]+/g, '_');
    return normalized as any;
  }).pipe(
    z.nativeEnum(CaseStatus, {
      errorMap: () => ({ message: 'Invalid case status' }),
    })
  ),
  remarks: z.string().min(2, 'Remarks must be at least 2 characters long').optional().default('Status updated by investigating officer'),
});

export const addNoteSchema = z.object({
  note: z.string().min(3, 'Note must be at least 3 characters long'),
});

export const updatePoliceProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().min(10).optional().or(z.literal('')),
  badgeNumber: z.string().min(2).optional(),
  department: z.string().min(2).optional(),
  stationName: z.string().optional(),
  station: z.string().optional(),
  rank: z.string().optional(),
});
