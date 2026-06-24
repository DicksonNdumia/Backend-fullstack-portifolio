import {
  catchErrors,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../error'
import type { Response, Request } from 'express'
import { validateOrThrow } from '../utils/helper/validate'
import { projectDataSchema } from '../validation/project'
import { db } from '../config/config.db'
import { Devlanguages, projectTable, toolsTable } from '../schema/shema'
import { eq } from 'drizzle-orm'
import type { UserRequest } from '../utils/types/userRequest'

export const addProject = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('User not authenticated')
    }

    const {
      name,
      description,
      shortDescription,
      demo,
      github,
      features,
      hostingPlatforms,
      languageId,
      toolsId,
    } = await validateOrThrow(projectDataSchema, req.body)

    const normalizedName = name.trim().toLowerCase()

    const [existingProject] = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.name, normalizedName))
      .limit(1)

    if (existingProject) {
      throw new ConflictError('Project with that name already exists!')
    }

    const [addNewProject] = await db
      .insert(projectTable)
      .values({
        name,
        description,
        shortDescription,
        demo,
        github,
        userId,
        features,
        hostingPlatforms,
        languageId,
        toolsId,
      })
      .returning()

    res.respond(addNewProject, 201)
  },
)

export const getProjects = catchErrors(async (_req: Request, res: Response) => {
  const projects = await db
    .select({
      id: projectTable.id,
      name: projectTable.name,
      description: projectTable.description,
      shortDescription: projectTable.shortDescription,
      demo: projectTable.demo,
      github: projectTable.github,
      features: projectTable.features,
      hostingPlatforms: projectTable.hostingPlatforms,

      language: Devlanguages.name,
      tool: toolsTable.name,
    })
    .from(projectTable)
    .leftJoin(Devlanguages, eq(projectTable.languageId, Devlanguages.id))
    .leftJoin(toolsTable, eq(projectTable.toolsId, toolsTable.id))

  res.respond(projects)
})

export const getProjectById = catchErrors(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const [project] = await db
      .select({
        id: projectTable.id,
        name: projectTable.name,
        description: projectTable.description,
        shortDescription: projectTable.shortDescription,
        demo: projectTable.demo,
        github: projectTable.github,
        features: projectTable.features,
        hostingPlatforms: projectTable.hostingPlatforms,

        language: Devlanguages.name,
        tool: toolsTable.name,
      })
      .from(projectTable)
      .leftJoin(Devlanguages, eq(projectTable.languageId, Devlanguages.id))
      .leftJoin(toolsTable, eq(projectTable.toolsId, toolsTable.id))
      .where(eq(projectTable.id, id))
      .limit(1)

    if (!project) {
      throw new NotFoundError('Project not found')
    }

    res.respond(project)
  },
)

export const updateProject = catchErrors(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const [existingProject] = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, id))
      .limit(1)

    if (!existingProject) {
      throw new NotFoundError('Project not found')
    }

    const data = await validateOrThrow(projectDataSchema, req.body)

    const normalizedName = data.name.trim().toLowerCase()

    const [projectWithSameName] = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.name, normalizedName))
      .limit(1)

    if (projectWithSameName && projectWithSameName.id !== id) {
      throw new ConflictError('Project with that name already exists!')
    }

    const [updatedProject] = await db
      .update(projectTable)
      .set({
        ...data,
        name: normalizedName,
        updatedAt: new Date(),
      })
      .where(eq(projectTable.id, id))
      .returning()

    res.respond(updatedProject)
  },
)

export const deleteProject = catchErrors(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id)

    const [deletedProject] = await db
      .delete(projectTable)
      .where(eq(projectTable.id, id))
      .returning()

    if (!deletedProject) {
      throw new NotFoundError('Project not found')
    }

    res.respond(
      {
        message: 'Project deleted successfully',
      },
      200,
    )
  },
)
