import type { Response, Request } from 'express'
import { catchErrors } from '../error/errorHandler.ts'
import {
  devDataSchema,
  idSchema,
  userIdSchema,
  listDevDataSchema,
} from '../validation/user.ts'
import { db } from '../config/config.db.ts'
import { devData, Devlanguages, userTable } from '../schema/shema.ts'
import { eq } from 'drizzle-orm'
import { NotFoundError, ConflictError } from '../error/customError.ts'
import { validateOrThrow } from '../utils/helper/validate.ts'

export const devDetails = catchErrors(async (req: Request, res: Response) => {
  const { userId } = await validateOrThrow(userIdSchema, req.params)

  const { name, email, phone, dateOfBirth, cv } = await validateOrThrow(
    devDataSchema,
    req.body,
  )

  const [existingUser] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1)

  if (!existingUser) {
    throw new NotFoundError('User not found')
  }

  const [existingDevProfile] = await db
    .select()
    .from(devData)
    .where(eq(devData.userId, userId))
    .limit(1)

  if (existingDevProfile) {
    throw new ConflictError('Developer profile already exists for this user')
  }

  const [createdDevProfile] = await db
    .insert(devData)
    .values({
      userId,
      name,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
      cv,
    })
    .returning({
      id: devData.id,
      userId: devData.userId,
      name: devData.name,
      email: devData.email,
      phone: devData.phone,
      cv: devData.cv,
      createdAt: devData.createdAt,
    })

  res.respond({ createdDevProfile })
})

export const getDevDetails = catchErrors(
  async (req: Request, res: Response) => {
    const id = await validateOrThrow(idSchema, req.params.id)
    console.log('This is the Id', id)

    const [user] = await db.select().from(devData).where(eq(devData.id, id))
    if (!user) {
      throw new NotFoundError('Dev Data was not found')
    }

    res.respond(user)
  },
)

export const deleteDevDetails = catchErrors(
  async (req: Request, res: Response) => {
    const id = await validateOrThrow(idSchema, req.params.id)

    const deleteUser = await db
      .delete(devData)
      .where(eq(devData.id, id))
      .returning({ deletedUserId: devData.id })

    res.respond(deleteUser)
  },
)
