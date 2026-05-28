import type { NextFunction, Response, Request } from 'express'
import { LoginSchema, UserSchema } from '../validation/auth.ts'
import { asyncHandler } from '../utils/helper/asyncHandler.ts'
import { db } from '../config/config.db.ts'
import bcrypt from 'bcryptjs'
import { userTable } from '../schema/shema.ts'

import { eq } from 'drizzle-orm'
import { generateToken } from '../utils/helper/generateToken.ts'

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log('Code Start!')
    const parsed = await UserSchema.safeParseAsync(req.body)
    console.log('Second')

    if (!parsed.success) {
      res.status(400).json({
        errors: 'Invalid Payload',
        details: parsed.error,
      })
      return
    }
    console.log('Third')

    try {
      const { name, email, password: hashedPassword, role } = parsed.data
      console.log('Code Reached')

      const existingUsers = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1)

      console.log('Fourth')

      if (existingUsers.length > 0) {
        res.status(400).json({
          errors: 'User Already Exists please login',
        })
        return
      }

      const [newUser] = await db
        .insert(userTable)
        .values({
          name,
          email,
          password: hashedPassword,
          role,
        })
        .returning({
          id: userTable.id,
          userName: userTable.name,
          email: userTable.email,
          role: userTable.role,
        })

      if (!newUser) {
        res.status(400).json({
          message: 'User not created error encountered',
        })
        return
      }

      generateToken(res, newUser.id, newUser.role)

      res.status(201).json({
        message: 'Successfully created user',
        newUser,
      })
    } catch (e) {
      next(e)
    }
  },
)

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = LoginSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        errors: 'Invalid Payload',
        details: parsed.error,
      })
      return
    }

    try {
      const { email, password } = parsed.data

      const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, email))
        .limit(1)

      if (!user) {
        res.status(401).json({ errors: 'Invalid email or password' })
        return
      }

      const isPasswordValid = await bcrypt.compare(password, user.password)

      if (!isPasswordValid) {
        res.status(401).json({ errors: 'Invalid email or password' })
        return
      }

      generateToken(res, user.id, user.role)

      res.status(200).json({
        message: 'Successfully logged in',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (e) {
      next(e)
    }
  },
)

export const logoutUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const isProduction = process.env.NODE_ENV === 'production'

    res.cookie('access_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      expires: new Date(0),
    })

    res.cookie('refresh_token', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      expires: new Date(0),
    })

    res.status(200).json({
      message: 'User logged out successfully',
    })
  },
)
