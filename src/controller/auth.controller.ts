import type { Response, Request } from 'express'
import { LoginSchema, UserSchema } from '../validation/auth.ts'
import {
  UnauthorizedError,
  UserAlreadyExistsError,
  DatabaseError,
} from '../error/customError.ts'
import { db } from '../config/config.db.ts'
import bcrypt from 'bcryptjs'
import { userTable } from '../schema/shema.ts'
import { catchErrors } from '../error/errorHandler.ts'
import { eq } from 'drizzle-orm'
import { generateToken } from '../utils/helper/generateToken.ts'
import { validateOrThrow } from '../utils/helper/validate.ts'

export const register = catchErrors(async (req: Request, res: Response) => {
  const {
    name,
    email,
    password: hashedPassword,
    role,
  } = await validateOrThrow(UserSchema, req.body)

  const existingUsers = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1)

  if (existingUsers.length > 0) {
    throw new UserAlreadyExistsError()
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
    throw new DatabaseError('User creation failed')
  }

  generateToken(res, newUser.id, newUser.role)

  res.respond({ newUser })
})

export const login = catchErrors(async (req: Request, res: Response) => {
  const { email, password } = await validateOrThrow(LoginSchema, req.body)

  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1)

  if (!user) {
    throw new UnauthorizedError()
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new UnauthorizedError()
  }

  generateToken(res, user.id, user.role)

  res.respond({ user })
})

export const logoutUser = catchErrors(async (_req: Request, res: Response) => {
  const isSecureCookie = process.env.NODE_ENV !== 'development'

  const cookieOptions = {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: 'strict' as const,
    expires: new Date(0),
  }

  res.cookie('access_token', '', cookieOptions)
  res.cookie('refresh_token', '', cookieOptions)

  res.respond({
    message: 'User logged out successfully',
  })
})
