import {
  BadUserInputError,
  catchErrors,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../error'
import { validateOrThrow } from '../utils/helper/validate'
import type { UserRequest } from '../utils/types/userRequest'
import type { Response } from 'express'
import { blogCommentSchema } from '../validation/blogComments'
import { db } from '../config/config.db'
import { blogComments } from '../schema/shema'
import { eq } from 'drizzle-orm'

export const addBlogComment = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('User is not authenticated!')
    }

    const blogId = Number(req.params.blogId)

    const { comment } = await validateOrThrow(blogCommentSchema, req.body)

    const existingComment = await db.query.blogComments.findFirst({
      where: (blogComment, { and, eq }) =>
        and(
          eq(blogComment.comment, comment),
          eq(blogComment.userId, userId),
          eq(blogComment.blogId, blogId),
        ),
    })

    if (existingComment) {
      throw new ConflictError('Comment already exists!')
    }

    const [newComment] = await db
      .insert(blogComments)
      .values({
        comment,
        userId,
        blogId,
      })
      .returning()

    res.respond(newComment, 201)
  },
)
export const getBlogComments = catchErrors(async (_req, res: Response) => {
  const comments = await db.query.blogComments.findMany({
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      blog: true,
    },
  })

  res.json({
    success: true,
    data: comments,
  })
})
export const getBlogCommentById = catchErrors(async (req, res: Response) => {
  const id = Number(req.params.id)

  const comment = await db.query.blogComments.findFirst({
    where: (comment, { eq }) => eq(comment.id, id),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      blog: true,
    },
  })

  if (!comment) {
    throw new NotFoundError('Comment not found.')
  }

  res.json({
    success: true,
    data: comment,
  })
})

export const updateBlogComment = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id
    const id = Number(req.params.id)

    if (!userId) {
      throw new UnauthorizedError('User is not authenticated!')
    }

    const body = await validateOrThrow(blogCommentSchema, req.body)

    const comment = await db.query.blogComments.findFirst({
      where: (comment, { eq }) => eq(comment.id, id),
    })

    if (!comment) {
      throw new NotFoundError('Comment not found.')
    }

    if (comment.userId !== userId) {
      throw new UnauthorizedError('You cannot update this comment.')
    }

    const [updated] = await db
      .update(blogComments)
      .set({
        comment: body.comment,
      })
      .where(eq(blogComments.id, id))
      .returning()

    res.json({
      success: true,
      message: 'Comment updated successfully.',
      data: updated,
    })
  },
)
export const deleteBlogComment = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id
    const id = Number(req.params.id)

    if (!userId) {
      throw new UnauthorizedError('User is not authenticated!')
    }

    const comment = await db.query.blogComments.findFirst({
      where: (comment, { eq }) => eq(comment.id, id),
    })

    if (!comment) {
      throw new NotFoundError('Comment not found.')
    }

    if (comment.userId !== userId) {
      throw new UnauthorizedError('You cannot delete this comment.')
    }

    await db.delete(blogComments).where(eq(blogComments.id, id))

    res.json({
      success: true,
      message: 'Comment deleted successfully.',
    })
  },
)
