import { z } from 'zod';
import { CrimeCategory } from '../constants/index.js';

export const reportCrimeSchema = z.object({
  category: z.string().transform((val) => {
    const normalized = val.toUpperCase().trim().replace(/[\s-]+/g, '_');
    return normalized as any;
  }).pipe(
    z.nativeEnum(CrimeCategory, {
      errorMap: () => ({ message: 'Invalid crime category' }),
    })
  ),
  title: z.string().min(3).optional(),
  incidentDate: z.string().or(z.date()).transform((val) => new Date(val)),
  incidentTime: z.string().optional().default('12:00'),
  location: z.object({
    address: z.string().optional().default('Incident Location'),
    city: z.string().optional().default('Mumbai'),
    state: z.string().optional().default('Maharashtra'),
    pincode: z.string().optional().default('400001'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).optional(),
  }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  suspectInfo: z.string().optional(),
  isEmergency: z.boolean().optional().default(false),
  contactPreference: z.enum(['PHONE', 'EMAIL']).optional().default('EMAIL'),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional().or(z.literal('')),
  address: z.string().optional().or(z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).transform((obj) => Object.values(obj).filter(Boolean).join(', '))),
});
