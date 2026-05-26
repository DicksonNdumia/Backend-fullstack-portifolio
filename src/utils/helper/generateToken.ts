import jwt from 'jsonwebtoken'
import type { Response } from 'express'
import dotenv from 'dotenv'

dotenv.config()

//Debbugging - Checking if env var are loaded corrrectly
console.log('This is the JWT_SECRET', process.env.JWT_SECRET)
console.log('REFRESH_TOKEN_SECRET', process.env.REFRESH_TOKEN_SECRET)

export const generateToken = (
  res: Response,
  userId: string,
  roleId: number,
) => {
  const jwtSecret = process.env.JWT_SECRET
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET

  if (!jwtSecret || !refreshSecret) {
    throw new Error('JWT_SECRET or RFRESH_TOKEN_SECRET is not defined')
  }

  try {
    //Lets generate a short lived access token for 15minutes
    //sign(payload: string | Buffer | object, secretOrPrivateKey: jwt.Secret | jwt.PrivateKey, options?: jwt.SignOptions): string
    const accessToken = jwt.sign({ userId, roleId }, jwtSecret, {
      expiresIn: '15min',
    })

    //lets generate  a long lived that will last for 30days
    //We don't pass the roleId for security purpose...
    const refreshToken = jwt.sign({ userId }, refreshSecret, {
      expiresIn: '30d',
    })

    //set Access token as HTTP-Only secure cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', // Secure in production
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    })

    // Set Refresh Token as HTTP-Only Secure Cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development', //secure for production
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })

    return { accessToken, refreshToken }
  } catch (error) {
    console.error('Error generating JWT:', error)
    throw new Error('Error generating authentication tokens')
  }
}
