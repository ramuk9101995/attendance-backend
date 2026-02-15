import { z } from 'zod';

// User Schemas
export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Attendance Schemas
export const checkInSchema = z.object({
  notes: z.string().optional(),
});

export const checkOutSchema = z.object({
  notes: z.string().optional(),
});

// Task Schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  due_date: z.string().datetime().optional().nullable(),
});

// Types
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
