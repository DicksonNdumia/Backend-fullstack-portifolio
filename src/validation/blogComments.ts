import { z } from 'zod'

export const blogCommentSchema = z.object({
  comment: z.string().min(1, 'Comment is Required').max(255),
})
