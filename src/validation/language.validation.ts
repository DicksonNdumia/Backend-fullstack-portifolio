import { z } from 'zod'

export const languageId = z.coerce.number().int().positive()

export const DevlanguageDataSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  proficiency: z
    .enum(['beginner', 'intermediate', 'expert'])
    .default('beginner'),
  experience: z.string().min(1, 'Experience is required').max(255),
})

export const listDevlanguageSchema = z.object({
  limit: z.coerce.number().int().max(100).optional(),
})
