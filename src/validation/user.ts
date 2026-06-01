import { z } from 'zod'

export const listDevDataSchema = z.object({
  limit: z.coerce.number().int().max(100).optional(),
})



export const devDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),

  email: z.email('Invalid email format').max(255),

  phone: z
      .string()
      .regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),

  dateOfBirth: z.iso.date(),

  cv: z.url('Invalid CV URL'),
})
