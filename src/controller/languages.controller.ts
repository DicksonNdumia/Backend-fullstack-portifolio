import type { Response, Request } from 'express'
import { catchErrors, ConflictError, NotFoundError } from '../error'
import { validateOrThrow } from '../utils/helper/validate'
import { userIdSchema } from '../validation/user'
import { DevlanguageDataSchema } from '../validation/language.validation'
import { db } from '../config/config.db'
import { Devlanguages } from '../schema/shema'
import { and, asc, eq } from 'drizzle-orm'

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

    res.respond(addNewDeveloperLanguage)
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
