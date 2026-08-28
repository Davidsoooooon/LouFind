import { z } from 'zod';
import { CATEGORIES } from './types';
import { LOCATIONS } from './seed';
export const reportSchema = z.object({
  type: z.enum(['lost', 'found']),
  title: z.string().trim().min(3, 'Use at least 3 characters.').max(100),
  category: z.enum(CATEGORIES),
  color: z.string().min(1, 'Choose a color.'),
  brand: z.string().trim().max(80),
  description: z
    .string()
    .trim()
    .min(15, 'Add at least 15 characters to help identify the item.')
    .max(1000),
  identifyingFeatures: z.string().trim().max(1000),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a valid date.')
    .refine(
      (v) =>
        !Number.isNaN(Date.parse(v)) &&
        new Date(v).toISOString().slice(0, 10) === v &&
        v <= new Date().toLocaleDateString('en-CA'),
      'Choose today or an earlier date.',
    ),
  time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Choose an approximate time.'),
  locationId: z
    .string()
    .refine(
      (v) => LOCATIONS.some((l) => l.id === v),
      'Choose a campus location.',
    ),
  imageUrl: z.string(),
  contactPreference: z.string(),
});
export const claimSchema = z.object({
  lostReportId: z.string().optional(),
  details: z
    .string()
    .trim()
    .min(15, 'Describe a private identifying detail in at least 15 characters.')
    .max(1000),
  contents: z.string().trim().max(1000),
  proof: z
    .string()
    .trim()
    .min(10, 'Explain what proof you can provide (at least 10 characters).')
    .max(1000),
  imageUrl: z.string(),
});
export const authSchema = z.object({
  email: z
    .email('Enter a valid school email.')
    .trim()
    .refine(
      (v) => /^[^@]+@westbridge\.edu\.ph$/i.test(v),
      'Use your @westbridge.edu.ph school email.',
    ),
  password: z.string().min(8, 'Use at least 8 characters.').max(128),
});
export const registrationSchema = authSchema.extend({
  name: z.string().trim().min(2, 'Enter your full name.').max(80),
  schoolId: z.string().trim().min(4, 'Enter a valid school ID.').max(30),
  role: z.enum(['student', 'staff']),
});
export const COLORS = [
  'Black',
  'White',
  'Blue',
  'Navy',
  'Green',
  'Red',
  'Grey',
  'Cream',
  'Brown',
  'Yellow',
  'Pink',
  'Multicolor',
];
