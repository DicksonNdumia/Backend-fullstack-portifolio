import { z } from 'zod'
import bcrypt from 'bcryptjs'

export const role = {
  ADMIN: 'admin',
  USER: 'user',
}

export const UserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().min(10, 'Invalid email format').max(255),
  // Matches the exact tuple elements defined in your pgEnum
  role: z.enum(['admin', 'user']).default('user'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .max(255)
    .transform(async (val) => {
      const salt = await bcrypt.genSalt(10)
      return await bcrypt.hash(val, salt)
    }),
})

export const listUserSchema = z.object({
  limit: z.coerce.number().int().max(100).optional(),
})

// Add this below your UserSchema
export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})
