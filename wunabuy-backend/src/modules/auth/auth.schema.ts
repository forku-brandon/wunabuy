import { z } from 'zod';

export const authSchema = z.object({
  phone: z.string().min(10, 'Valid phone number required'),
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['buyer', 'seller', 'transporter']).default('buyer'),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
});

export const otpSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const loginSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(1),
}).refine(data => data.phone || data.email, { message: 'Phone or email required' });

export const passwordResetSchema = z.object({
  phone: z.string().min(10),
});

export const passwordResetConfirmSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
  new_password: z.string().min(8),
});
