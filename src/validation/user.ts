import { z } from 'zod'

export const listDevDataSchema = z.object({
  limit: z.coerce.number().int().max(100).optional(),
})

export const isoDateString = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid ISO date string',
  })
export const devDataSchema = z.object({
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  userId: z.int(),
  dateOfBirth: isoDateString,
  cv: z.string(),
})
