import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['STUDENT', 'MANAGER']),
    fullName: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'STUDENT') {
        return data.fullName && data.fullName.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Full name is required for students',
      path: ['fullName'],
    }
  );

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;