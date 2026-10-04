import { z } from 'zod';

export const assignCaseSchema = z.object({
  officerId: z.string().min(1, 'Officer ID is required'),
});

export const updateAdminProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
});
