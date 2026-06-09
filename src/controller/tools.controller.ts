import type { Response, Request } from 'express'
import { catchErrors, ConflictError, NotFoundError } from '../error'
import { validateOrThrow } from '../utils/helper/validate'
import { ToolDataSchema } from '../validation/tools'
import { db } from '../config/config.db'
import { toolsTable } from '../schema/shema'
import { eq } from 'drizzle-orm'

export const addTools = catchErrors(async (req: Request, res: Response) => {
  const { name, description, image } = await validateOrThrow(
    ToolDataSchema,
    req.body,
  )
  const normalizedName = name.trim().toLowerCase()

  const [existingTool] = await db
    .select()
    .from(toolsTable)
    .where(eq(toolsTable.name, normalizedName))
    .limit(1)

  if (existingTool) {
    throw new ConflictError('Tool with that name already exists!')
  }

  const [addNewTool] = await db
    .insert(toolsTable)
    .values({
      name,
      description,
      image,
    })
    .returning()

  res.respond(addNewTool)
})

export const getTools = catchErrors(async (req: Request, res: Response) => {
  const tools = await db.query.toolsTable.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
    limit: 100,
    orderBy: (table, { asc }) => asc(table.createdAt),
  })

  if (tools.length === 0) {
    throw new NotFoundError('No tools were fetched have you tried creating')
  }
  res.respond(tools)
})
