import { z } from 'zod'

export const reviewDataSchema = z.object({
  rating: z.int().min(1, 'Rating of atleast is required').max(255),
  comment: z.string().min(1, 'Comment is Required').max(255),
})
