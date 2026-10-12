import { z } from 'zod';

export const assignCaseSchema = z.object({
  officerId: z.string().min(1, 'Officer ID is required'),
});

export const updateAdminProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().min(10).optional().or(z.literal('')),
});

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['CITIZEN', 'POLICE', 'ADMIN']),
  phone: z.string().optional().default(''),
  badgeNumber: z.string().optional(),
  rank: z.string().optional().default('Officer'),
  department: z.string().optional().default('General Operations'),
  stationName: z.string().optional().default('Central Station'),
});
