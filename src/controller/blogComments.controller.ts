import { catchErrors, ConflictError, UnauthorizedError } from '../error'
import { validateOrThrow } from '../utils/helper/validate'
import type { UserRequest } from '../utils/types/userRequest'
import type { Response } from 'express'
import { blogCommentSchema } from '../validation/blogComments'
import { db } from '../config/config.db'

export const addBlogComment = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('User is Not authenticated!')
    }

    const { comment } = await validateOrThrow(blogCommentSchema, req.body)

    const existingComment = await db.query.blogComments.findFirst({
      where: (blog, { and, eq }) =>
        and(eq(blog.comment, comment), eq(blog.userId, userId)),
    })

    if (existingComment) {
      throw new ConflictError('Blog Already Exists!')
    }
  },
)
