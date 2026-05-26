import jwt from 'jsonwebtoken'
import type { NextFunction, Response } from 'express'
import { asyncHandler } from '../../utils/helper/asyncHandler.ts'
import type { UserRequest } from '../../utils/types/userRequest.ts'
import { db } from '../../config/config.db.ts'

export const protect = asyncHandler(
  async (req: UserRequest, res: Response, next: NextFunction) => {
    let token

    // 1. Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
    }

    // 2. Fallback to cookies
    if (!token && req.cookies?.access_token) {
      token = req.cookies.access_token
    }

    // 3. No token = reject
    if (!token) {
      return res.status(401).json({
        message: 'Not authorized, no token',
      })
    }

    try {
      // 4. Verify JWT
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined')
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
        userId: number
        role: string
      }

      // 5. Get user from DB
      const user = await db.query.userTable.findFirst({
        where: (users, { eq }) => eq(users.id, decoded.userId),
      })

      // 6. If user not found
      if (!user) {
        return res.status(401).json({
          message: 'User not found',
        })
      }

      // 7. Attach user to request
      req.user = user

      next()
    } catch (error) {
      return res.status(401).json({
        message: 'Not authorized, token failed',
      })
    }
  },
)

export const admin = (req: UserRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Admin access only" });
    }

    next();
};