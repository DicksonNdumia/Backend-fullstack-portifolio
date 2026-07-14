import {
  catchErrors,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../error'
import type { Response, Request } from 'express'
import { validateOrThrow } from '../utils/helper/validate'
import { db } from '../config/config.db'
import { and, eq } from 'drizzle-orm'
import type { UserRequest } from '../utils/types/userRequest'
import { blogDataSchema } from '../validation/blogData'
import { blogData } from '../schema/shema'

export const createBlog = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id
    if (!userId) {
      throw new UnauthorizedError('User not authenticated')
    }

    const { name, description } = await validateOrThrow(
      blogDataSchema,
      req.body,
    )

    const existingBlog = await db.query.blogData.findFirst({
      where: (blog, { and, eq }) =>
        and(eq(blog.name, name), eq(blog.userId, userId)),
    })

    if (existingBlog) {
      throw new ConflictError('Blog already exists')
    }

    const [newBlog] = await db
      .insert(blogData)
      .values({
        name,
        description,
        userId,
      })
      .returning()

    res.respond(newBlog, 201)
  },
)
export const getBlogs = catchErrors(
  async (_req: UserRequest, res: Response) => {
    const blogs = await db.query.blogData.findMany({
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    res.respond(blogs)
  },
)

export const getBlogById = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('User not authenticated')
    }

    const blogId = Number(req.params.id)

    const blog = await db.query.blogData.findFirst({
      where: (blog, { and, eq }) =>
        and(eq(blog.id, blogId), eq(blog.userId, userId)),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        comments: {
          with: {
            user: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!blog) {
      throw new NotFoundError('Blog not found')
    }

    res.respond(blog)
  },
)
export const updateBlog = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('User not authenticated')
    }

    const blogId = Number(req.params.id)

    const { name, description } = await validateOrThrow(
      blogDataSchema,
      req.body,
    )

    const [updatedBlog] = await db
      .update(blogData)
      .set({
        name,
        description,
        updatedAt: new Date(),
      })
      .where(and(eq(blogData.id, blogId), eq(blogData.userId, userId)))
      .returning()

    if (!updatedBlog) {
      throw new NotFoundError('Blog not found')
    }

    res.respond(updatedBlog)
  },
)
export const deleteBlog = catchErrors(
  async (req: UserRequest, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      throw new UnauthorizedError('User not authenticated')
    }

    const blogId = Number(req.params.id)

    const [deletedBlog] = await db
      .delete(blogData)
      .where(and(eq(blogData.id, blogId), eq(blogData.userId, userId)))
      .returning()

    if (!deletedBlog) {
      throw new NotFoundError('Blog not found')
    }

    res.respond(
      {
        message: 'Blog deleted successfully',
      },
      200,
    )
  },
)
