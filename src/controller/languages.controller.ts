import type { Response, Request } from 'express'
import {
  catchErrors,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../error'
import { validateOrThrow } from '../utils/helper/validate'
import { userIdSchema } from '../validation/user'
import { DevlanguageDataSchema } from '../validation/language.validation'
import { db } from '../config/config.db'
import { Devlanguages } from '../schema/shema'
import { and, eq } from 'drizzle-orm'
import type { UserRequest } from '../utils/types/userRequest'

export const addDevLanguages = catchErrors(
  async (req: Request, res: Response) => {
    const { userId } = await validateOrThrow(userIdSchema, req.params)

    const { name, proficiency, experience } = await validateOrThrow(
      DevlanguageDataSchema,
      req.body,
    )
    const normalizedName = name.trim().toLowerCase()

    const [existingLanguage] = await db
      .select()
      .from(Devlanguages)
      .where(
        and(
          eq(Devlanguages.name, normalizedName),
          eq(Devlanguages.userId, userId),
        ),
      )
      .limit(1)

    if (existingLanguage) {
      throw new ConflictError(
        'Language with that name for the user already Exists',
      )
    }

    const [addNewDeveloperLanguage] = await db
      .insert(Devlanguages)
      .values({
        userId,
        name,
        proficiency,
        experience,
      })
      .returning({
        Language: Devlanguages.name,
        Proficiency: Devlanguages.proficiency,
        experience: Devlanguages.experience,
      })

    res.respond(addNewDeveloperLanguage, 201)
  },
)

export const getDevLanguages = catchErrors(
  async (req: Request, res: Response) => {
    const language = await db.query.Devlanguages.findMany({
      columns: { name: true, proficiency: true, experience: true },
      limit: 100,
      orderBy: (table, { asc }) => asc(table.createdAt),
    })

    if (language.length === 0) {
      throw new NotFoundError('Developer Language was not found')
    }

    res.respond(language)
  },
)
export const getDevLAnguageById = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('User not authenticated')
    }

    const languageId = Number(req.params.id)

    const devLanguage = await db.query.Devlanguages.findFirst({
      where: (language, { and, eq }) =>
        and(eq(language.id, languageId), eq(language.userId, userId)),
      with: {
        devLanguage: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })
    if (!devLanguage) {
      throw new NotFoundError('Dev Language Not Found')
    }
    res.respond(devLanguage)
  },
)
export const deleteDevLanguage = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('User not authenticated')
    }

    const languageId = Number(req.params.id)

    const [deletedDevLanguage] = await db
      .delete(Devlanguages)
      .where(
        and(eq(Devlanguages.id, languageId), eq(Devlanguages.userId, userId)),
      )
      .returning()

    if (!deletedDevLanguage) {
      throw new NotFoundError('Dev Language not Found')
    }
    res.respond(
      {
        message: 'Dev Language deleted successfully',
      },
      200,
    )
  },
)
