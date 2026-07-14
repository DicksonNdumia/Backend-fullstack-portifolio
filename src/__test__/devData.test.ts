import { db } from '../config/config.db.ts'
import { validateOrThrow } from '../utils/helper/validate.ts'
import type { Request, Response } from 'express'
import { NotFoundError, ConflictError } from '../error/customError.ts'
import {
  deleteDevDetails,
  devDetails,
  getDevDetails,
} from '../controller/devData.controller.ts'

// 1. Mock catchErrors immediately so thrown errors bubble directly into Jest
jest.mock('../error/errorHandler.ts', () => ({
  catchErrors: (fn: Function) => fn,
}))

// 2. Mock external dependencies
jest.mock('../config/config.db.ts', () => ({
  db: {
    select: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    limit: jest.fn(),
    insert: jest.fn(),
    values: jest.fn(),
    delete: jest.fn(),
    returning: jest.fn(),
  },
}))

jest.mock('../utils/helper/validate.ts', () => ({
  validateOrThrow: jest.fn(),
}))

describe('Developer Details Controller Tests', () => {
  let req: Partial<Request>
  let res: Partial<Response>

  beforeEach(() => {
    jest.clearAllMocks()
    req = { params: {}, body: {} }
    res = {
      respond: jest.fn(),
    }
  })

  // Helper utility to clean up fluent Drizzle chaining
  const mockDrizzleChain = (mockMethod: jest.Mock, finalValue: any) => {
    const chain = () => ({
      from: jest.fn().mockImplementation(() => ({
        where: jest.fn().mockImplementation(() => ({
          limit: jest.fn().mockResolvedValue(finalValue),
          // handle direct resolutions without .limit()
          then: (resolve: any) => Promise.resolve(finalValue).then(resolve),
        })),
        // fallback in case of straight .where() without .limit()
        whereMock: jest.fn().mockResolvedValue(finalValue),
      })),
      values: jest.fn().mockImplementation(() => ({
        returning: jest.fn().mockResolvedValue(finalValue),
      })),
      where: jest.fn().mockImplementation(() => ({
        returning: jest.fn().mockResolvedValue(finalValue),
      })),
    })
    mockMethod.mockImplementation(chain)
  }

  /* -------------------------------------------------------------------------- */
  /* devDetails (Create Profile) Tests                                         */
  /* -------------------------------------------------------------------------- */
  describe('devDetails', () => {
    const mockBody = {
      name: 'Jane Dev',
      email: 'jane@dev.com',
      phone: '123456789',
      dateOfBirth: '2000-01-01',
      cv: 'cv_link_url',
    }

    it('should successfully create a developer profile', async () => {
      req.params = { userId: 'user-123' }
      req.body = mockBody
      ;(validateOrThrow as jest.Mock)
        .mockResolvedValueOnce({ userId: 'user-123' }) // first call (params)
        .mockResolvedValueOnce(mockBody) // second call (body)

      // Step 1: User exists
      const dbSelectSpy = db.select as jest.Mock
      dbSelectSpy.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: jest.fn().mockResolvedValue([{ id: 'user-123' }]),
          }),
        }),
      }))

      // Step 2: Existing profile doesn't exist (returns empty array)
      dbSelectSpy.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({ limit: jest.fn().mockResolvedValue([]) }),
        }),
      }))

      // Step 3: Insert profile success
      const createdProfile = {
        id: 'profile-99',
        userId: 'user-123',
        name: 'Jane Dev',
      }
      mockDrizzleChain(db.insert as jest.Mock, [createdProfile])

      await devDetails(req as Request, res as Response, () => {})

      expect(res.respond).toHaveBeenCalledWith(createdProfile, 201)
    })

    it('should throw NotFoundError if the base user does not exist', async () => {
      ;(validateOrThrow as jest.Mock).mockResolvedValue({ userId: 'ghost-id' })

      // User query returns nothing
      mockDrizzleChain(db.select as jest.Mock, [])

      await expect(
        devDetails(req as Request, res as Response, () => {}),
      ).rejects.toThrow(NotFoundError)
    })

    it('should throw ConflictError if profile already exists for that user', async () => {
      ;(validateOrThrow as jest.Mock)
        .mockResolvedValueOnce({ userId: 'user-123' })
        .mockResolvedValueOnce(mockBody)

      const dbSelectSpy = db.select as jest.Mock
      // 1st call: User exists
      dbSelectSpy.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: jest.fn().mockResolvedValue([{ id: 'user-123' }]),
          }),
        }),
      }))
      // 2nd call: Profile also exists!
      dbSelectSpy.mockImplementationOnce(() => ({
        from: () => ({
          where: () => ({
            limit: jest.fn().mockResolvedValue([{ id: 'profile-exists' }]),
          }),
        }),
      }))

      await expect(
        devDetails(req as Request, res as Response, () => {}),
      ).rejects.toThrow(ConflictError)
    })
  })

  /* -------------------------------------------------------------------------- */
  /* getDevDetails Tests                                                       */
  /* -------------------------------------------------------------------------- */
  describe('getDevDetails', () => {
    it('should successfully fetch dev details by id', async () => {
      req.params = { id: 'profile-123' }
      ;(validateOrThrow as jest.Mock).mockResolvedValue('profile-123')

      const mockProfile = { id: 'profile-123', name: 'Jane Dev' }

      // Simulating a query chain where .where() directly resolves via a custom thenable or chain
      ;(db.select as jest.Mock).mockImplementationOnce(() => ({
        from: () => ({
          where: () => Promise.resolve([mockProfile]),
        }),
      }))

      await getDevDetails(req as Request, res as Response, () => {})

      expect(res.respond).toHaveBeenCalledWith(mockProfile)
    })

    it('should throw NotFoundError if dev profile is not found', async () => {
      req.params = { id: 'invalid-id' }
      ;(validateOrThrow as jest.Mock).mockResolvedValue('invalid-id')
      ;(db.select as jest.Mock).mockImplementationOnce(() => ({
        from: () => ({
          where: () => Promise.resolve([]), // no records found
        }),
      }))

      await expect(
        getDevDetails(req as Request, res as Response, () => {}),
      ).rejects.toThrow(NotFoundError)
    })
  })

  /* -------------------------------------------------------------------------- */
  /* deleteDevDetails Tests                                                    */
  /* -------------------------------------------------------------------------- */
  describe('deleteDevDetails', () => {
    it('should successfully delete dev details and return the deleted meta', async () => {
      req.params = { id: 'profile-123' }
      ;(validateOrThrow as jest.Mock).mockResolvedValue('profile-123')

      const deletePayload = [{ deletedUserId: 'profile-123' }]
      mockDrizzleChain(db.delete as jest.Mock, deletePayload)

      await deleteDevDetails(req as Request, res as Response, () => {})

      expect(res.respond).toHaveBeenCalledWith(deletePayload)
    })

    it('should throw NotFoundError if no record was deleted', async () => {
      req.params = { id: 'non-existent-id' }
      ;(validateOrThrow as jest.Mock).mockResolvedValue('non-existent-id')

      mockDrizzleChain(db.delete as jest.Mock, []) // Array length 0 indicates no record found/deleted

      await expect(
        deleteDevDetails(req as Request, res as Response, () => {}),
      ).rejects.toThrow(NotFoundError)
    })
  })
})
