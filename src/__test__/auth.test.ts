import { db } from '../config/config.db.ts'
import { validateOrThrow } from '../utils/helper/validate.ts'
import { generateToken } from '../utils/helper/generateToken.ts'
import bcrypt from 'bcryptjs'
import type { Request, Response } from 'express'
import {
  UserAlreadyExistsError,
  UnauthorizedError,
  DatabaseError,
} from '../error/customError.ts'

import { login, logoutUser, register } from '../controller/auth.controller.ts'

// 1. Mock the dependencies
jest.mock('../config/config.db.ts', () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    insert: jest.fn(),
    values: jest.fn(),
    returning: jest.fn(),
  },
}))
// Add this near your other jest.mock() statements!
jest.mock('../error/errorHandler.ts', () => ({
  // This bypasses the wrapper and executes the underlying controller directly
  catchErrors: (fn: Function) => fn,
}))

jest.mock('../utils/helper/validate.ts', () => ({
  validateOrThrow: jest.fn(),
}))

jest.mock('../utils/helper/generateToken.ts', () => ({
  generateToken: jest.fn(),
}))

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

describe('Auth Controller Tests', () => {
  let req: Partial<Request>
  let res: Partial<Response>

  beforeEach(() => {
    jest.clearAllMocks()

    req = { body: {} }
    res = {
      respond: jest.fn(), // Mock custom method
      cookie: jest.fn(),
    }
  })

  // Helper to chain Drizzle queries easily
  const mockDrizzleChain = (mockMethod: jest.Mock, finalValue: any) => {
    const chain = () => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockResolvedValue(finalValue),
        })),
      })),
      values: jest.fn().mockImplementation(() => ({
        returning: jest.fn().mockResolvedValue(finalValue),
      })),
    })
    mockMethod.mockImplementation(chain)
  }

  /* -------------------------------------------------------------------------- */
  /* Register Tests                                  */
  /* -------------------------------------------------------------------------- */
  describe('register', () => {
    it('should successfully register a new user', async () => {
      const mockUserData = {
        name: 'John',
        email: 'john@example.com',
        password: 'hashed_password',
        role: 'user',
      }
      ;(validateOrThrow as jest.Mock).mockResolvedValue(mockUserData)

      // existingUsers length is 0 (doesn't exist)
      mockDrizzleChain(db.select as jest.Mock, [])
      // newUser is returned successfully
      mockDrizzleChain(db.insert as jest.Mock, [{ id: 1, ...mockUserData }])

      await register(req as Request, res as Response, () => {})

      expect(validateOrThrow).toHaveBeenCalled()
      expect(generateToken).toHaveBeenCalledWith(res, 1, 'user')
      expect(res.respond).toHaveBeenCalledWith({ id: 1, ...mockUserData }, 201)
    })

    it('should throw UserAlreadyExistsError if email is taken', async () => {
      ;(validateOrThrow as jest.Mock).mockResolvedValue({
        email: 'taken@example.com',
      })
      // user exists
      mockDrizzleChain(db.select as jest.Mock, [{ id: 1 }])

      await expect(
        register(req as Request, res as Response, () => {}),
      ).rejects.toThrow(UserAlreadyExistsError)
    })

    it('should throw DatabaseError if user creation fails to return data', async () => {
      ;(validateOrThrow as jest.Mock).mockResolvedValue({
        email: 'john@example.com',
      })
      mockDrizzleChain(db.select as jest.Mock, [])
      // returns empty array for new user
      mockDrizzleChain(db.insert as jest.Mock, [])

      await expect(
        register(req as Request, res as Response, () => {}),
      ).rejects.toThrow(DatabaseError)
    })
  })

  /* -------------------------------------------------------------------------- */
  /* Login Tests                                   */
  /* -------------------------------------------------------------------------- */
  describe('login', () => {
    it('should successfully login and return user details', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' }
      const existingUser = {
        id: 1,
        email: 'test@example.com',
        password: 'hashedPassword',
        role: 'user',
      }

      ;(validateOrThrow as jest.Mock).mockResolvedValue(credentials)
      mockDrizzleChain(db.select as jest.Mock, [existingUser])
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

      await login(req as Request, res as Response, () => {})

      expect(generateToken).toHaveBeenCalledWith(res, 1, 'user')
      expect(res.respond).toHaveBeenCalledWith(existingUser)
    })

    it('should throw UnauthorizedError if user is not found', async () => {
      ;(validateOrThrow as jest.Mock).mockResolvedValue({
        email: 'wrong@example.com',
      })
      mockDrizzleChain(db.select as jest.Mock, []) // No user found

      await expect(
        login(req as Request, res as Response, () => {}),
      ).rejects.toThrow(UnauthorizedError)
    })

    it('should throw UnauthorizedError if password does not match', async () => {
      ;(validateOrThrow as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        password: 'wrong',
      })
      mockDrizzleChain(db.select as jest.Mock, [{ id: 1, password: 'hashed' }])
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false) // Password wrong

      await expect(
        login(req as Request, res as Response, () => {}),
      ).rejects.toThrow(UnauthorizedError)
    })
  })

  /* -------------------------------------------------------------------------- */
  /* Logout Tests                                   */
  /* -------------------------------------------------------------------------- */
  describe('logoutUser', () => {
    it('should clear cookies and call res.respond', async () => {
      await logoutUser(req as Request, res as Response, () => {})

      expect(res.cookie).toHaveBeenCalledWith(
        'access_token',
        '',
        expect.any(Object),
      )
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        '',
        expect.any(Object),
      )
      expect(res.respond).toHaveBeenCalledWith({
        message: 'User logged out successfully',
      })
    })
  })
})
