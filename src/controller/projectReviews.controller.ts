import {
  catchErrors,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../error'
import { validateOrThrow } from '../utils/helper/validate'
import type { UserRequest } from '../utils/types/userRequest'
import type { Response } from 'express'
import { reviewDataSchema } from '../validation/review'
import { db } from '../config/config.db'
import { projectReviews } from '../schema/shema'

export const addReview = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('User not authenticated')
    }

    const projectId = Number(req.params.id)

    const { rating, comment } = await validateOrThrow(
      reviewDataSchema,
      req.body,
    )

    const checkIfReview = await db.query.projectReviews.findFirst({
      where: (review, { and, eq }) =>
        and(eq(review.projectId, projectId), eq(review.userId, userId)),
    })

    if (checkIfReview) {
      throw new ConflictError('Review Already Added')
    }

    const [newReview] = await db
      .insert(projectReviews)
      .values({
        rating,
        comment,
        userId,
        projectId,
      })
      .returning()

    res.respond(newReview, 201)
  },
)
export const getReviews = catchErrors(
  async (_req: UserRequest, res: Response) => {
    const reviews = await db.query.projectReviews.findMany({
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        project: true,
      },
    })
    if (!reviews) {
      throw new NotFoundError('Error missing Reviews')
    }
    res.respond(reviews)
  },
)
