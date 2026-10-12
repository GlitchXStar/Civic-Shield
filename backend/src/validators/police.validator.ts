import { z } from 'zod';
import { CaseStatus } from '../constants/index.js';

export const updateStatusSchema = z.object({
  status: z.nativeEnum(CaseStatus, {
    errorMap: () => ({ message: 'Invalid case status' }),
  }),
  remarks: z.string().min(5, 'Remarks must be at least 5 characters long'),
});

export const addNoteSchema = z.object({
  note: z.string().min(5, 'Note must be at least 5 characters long'),
});

export const updatePoliceProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  badgeNumber: z.string().min(3).optional(),
  department: z.string().min(2).optional(),
});
