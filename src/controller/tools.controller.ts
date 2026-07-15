import type { Response, Request } from 'express'
import {
  catchErrors,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../error'
import { validateOrThrow } from '../utils/helper/validate'
import { ToolDataSchema } from '../validation/tools'
import { db } from '../config/config.db'
import { toolsTable } from '../schema/shema'
import { and, eq } from 'drizzle-orm'
import type { UserRequest } from '../utils/types/userRequest'

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
      name: normalizedName,
      description: description.trim(),
      image: image.trim(),
    })
    .returning()

  res.respond(addNewTool, 201)
})
export const getTools = catchErrors(async (req: Request, res: Response) => {
  const tools = await db.select().from(toolsTable)

  res.respond(tools)
})

export const getToolById = catchErrors(
  async (req: UserRequest, res: Response) => {
    const toolId = Number(req.params.id)

    const [tool] = await db
      .select()
      .from(toolsTable)
      .where(eq(toolsTable.id, toolId))

    if (!tool) {
      throw new NotFoundError('Tool with That ID not found!')
    }
    res.respond(tool)
  },
)

export const updateTool = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('User not authenticated')
    }

    const toolId = Number(req.params.id)

    const { name, description, image } = await validateOrThrow(
      ToolDataSchema,
      req.body,
    )

    const [updatedTool] = await db
      .update(toolsTable)
      .set({
        name,
        description,
        image,
        updatedAt: new Date(),
      })
      .where(eq(toolsTable.id, toolId))
      .returning()

    if (!updatedTool) {
      throw new NotFoundError('Project Not Found!')
    }
    res.respond(updatedTool)
  },
)

export const deleteTool = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('User not authenticated!')
    }
    const toolId = Number(req.params.id)

    const [deleteTool] = await db
      .delete(toolsTable)
      .where(eq(toolsTable.id, toolId))
      .returning()
    if (!deleteTool) {
      throw new NotFoundError('Project with that Id Not Found!')
    }
    res.respond(
      {
        message: 'Project deleted successfully',
      },
      200,
    )
  },
)
