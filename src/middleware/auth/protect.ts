import jwt from 'jsonwebtoken'
import type { NextFunction, Response } from 'express'
import { asyncHandler } from '../../utils/helper/asyncHandler.ts'
import type { UserRequest } from '../../utils/types/userRequest.ts'
import { db } from '../../config/config.db.ts'
import {
  InvalidTokenError,
  UserNotFound,
  MissingToken,
  UnauthorizedError,
  ForbiddenError,
} from '../../error/customError.ts'

export const protect = asyncHandler(
  async (req: UserRequest, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : req.cookies?.access_token

    if (!token) {
      throw new MissingToken()
    }

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    let decoded: {
      userId: number
      role: string
    }

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: number
        role: string
      }
    } catch {
      throw new InvalidTokenError()
    }

    const user = await db.query.userTable.findFirst({
      where: (users, { eq }) => eq(users.id, decoded.userId),
    })

    if (!user) {
      throw new UserNotFound()
    }

    req.user = user

    next()
  },
)

export const authorize =
  (...roles: string[]) =>
  (req: UserRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Not authenticated')
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Access denied')
    }

    next()
  }
