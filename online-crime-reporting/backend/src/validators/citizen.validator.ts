import { z } from 'zod';
import { CrimeCategory } from '../constants/index.js';

export const reportCrimeSchema = z.object({
  category: z.nativeEnum(CrimeCategory, {
    errorMap: () => ({ message: 'Invalid crime category' }),
  }),
  incidentDate: z.string().or(z.date()).transform((val) => new Date(val)),
  incidentTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Invalid time format (HH:MM)'),
  location: z.object({
    address: z.string().min(5, 'Address is too short'),
    city: z.string().min(2, 'City is too short'),
    state: z.string().min(2, 'State is too short'),
    pincode: z.string().regex(/^[1-9][0-9]{5}$/, 'Invalid pincode'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).optional(),
  }),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  suspectInfo: z.string().optional(),
  isEmergency: z.boolean().optional().default(false),
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(10).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
});
