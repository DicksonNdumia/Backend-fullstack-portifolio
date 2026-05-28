import jwt from 'jsonwebtoken'
import type { Response } from 'express'
import type { UserRequest } from '../types/userRequest.ts'

export const generateToken = (res: Response, userId: number, role: string) => {
  const jwtSecret = process.env.JWT_SECRET
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET

  if (!jwtSecret || !refreshSecret) {
    throw new Error('JWT_SECRET or REFRESH_TOKEN_SECRET is not defined')
  }

  const accessToken = jwt.sign({ userId, role }, jwtSecret, {
    expiresIn: '15m',
  })

  const refreshToken = jwt.sign({ userId }, refreshSecret, {
    expiresIn: '30d',
  })

  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  })

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}
