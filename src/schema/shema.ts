import {
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const userRole = pgEnum('role', ['admin', 'user'])
export const languageEnums = pgEnum('proficiency', [
  'beginner',
  'intermediate',
  'expert',
])

//My schema / Tables
export const userTable = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(),
    role: userRole('role').default('user').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    emailIndex: index('email_idx').on(table.email),
    roleIndex: index('role_idx').on(table.role),
  }),
)
export const toolsTable = pgTable('tools', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  image: varchar('image', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const projectTable = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  shortDescription: varchar('shortDescription', { length: 255 }).notNull(),
  demo: varchar('demo', { length: 255 }).notNull(),
  github: varchar('github', { length: 255 }).notNull(),
  toolsId: integer('toolId')
    .references(() => toolsTable.id, { onDelete: 'cascade' })
    .notNull(),
  userId: integer('userId').references(() => userTable.id),
  languageId: integer('languageId')
    .references(() => languages.id, { onDelete: 'cascade' })
    .notNull(),
  features: text('features').notNull(),
  hostingPlatforms: varchar('hostingPlatform', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const devData = pgTable('devData', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  userId: integer('userId')
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  phone: varchar('phone', { length: 255 }).notNull().unique(),
  dateOfBirth: timestamp('dateOfBirth').notNull(),
  cv: varchar('cv', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const Devlanguages = pgTable(
  'devLanguage',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    proficiency: languageEnums('proficiency').default('beginner').notNull(),
    experience: text('experience').notNull(),
    userId: integer('userId')
      .references(() => devData.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    uniqueLanguagePerUser: index('dev_language_user_name_idx').on(
      table.userId,
      table.name,
    ),
  }),
)
export const languages = pgTable('languages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const blogData = pgTable('blogs', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: varchar('description', { length: 255 }).notNull(),
  userId: integer('userId').references(() => userTable.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const blogComments = pgTable('blogComments', {
  id: serial('id').primaryKey(),
  comment: text('comment').notNull(),
  userId: integer('userId')
    .references(() => userTable.id, { onDelete: 'cascade' })
    .notNull(),
  blogId: integer('blogId')
    .references(() => blogData.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
export const projectReviews = pgTable(
  'projectReviews',
  {
    id: serial('id').primaryKey(),
    rating: integer('rating').notNull(),
    comment: text('comment').notNull(),
    userId: integer('userId')
      .references(() => userTable.id, { onDelete: 'cascade' })
      .notNull(),
    projectId: integer('projectId')
      .references(() => projectTable.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    userIndex: index('review_user_idx').on(table.userId),
    projectIndex: index('review_project_idx').on(table.projectId),
  }),
)

//Relations
export const userTableRelation = relations(userTable, ({ one, many }) => {
  return {
    devData: one(devData, {
      fields: [userTable.id],
      references: [devData.userId],
    }),

    projects: many(projectTable),

    blogs: many(blogData),

    blogComments: many(blogComments),

    projectReviews: many(projectReviews),
  }
})

export const devDataRelations = relations(devData, ({ one, many }) => {
  return {
    user: one(userTable, {
      fields: [devData.userId],
      references: [userTable.id],
    }),
    language: many(Devlanguages),
  }
})

export const projectRelations = relations(projectTable, ({ one, many }) => {
  return {
    tool: one(toolsTable, {
      fields: [projectTable.toolsId],
      references: [toolsTable.id],
    }),

    language: one(languages, {
      fields: [projectTable.languageId],
      references: [languages.id],
    }),

    user: one(userTable, {
      fields: [projectTable.userId],
      references: [userTable.id],
    }),

    reviews: many(projectReviews),
  }
})

export const toolRelations = relations(toolsTable, ({ many }) => {
  return {
    projects: many(projectTable),
  }
})

export const languageRelations = relations(languages, ({ many }) => {
  return {
    projects: many(projectTable),
  }
})

export const devlanguageRelations = relations(Devlanguages, ({ one }) => {
  return {
    devLanguage: one(devData, {
      fields: [Devlanguages.userId],
      references: [devData.id],
    }),
  }
})

export const blogRelations = relations(blogData, ({ one, many }) => {
  return {
    user: one(userTable, {
      fields: [blogData.userId],
      references: [userTable.id],
    }),

    comments: many(blogComments),
  }
})

export const blogCommentRelations = relations(blogComments, ({ one }) => {
  return {
    user: one(userTable, {
      fields: [blogComments.userId],
      references: [userTable.id],
    }),

    blog: one(blogData, {
      fields: [blogComments.blogId],
      references: [blogData.id],
    }),
  }
})

export const projectReviewRelations = relations(projectReviews, ({ one }) => {
  return {
    user: one(userTable, {
      fields: [projectReviews.userId],
      references: [userTable.id],
    }),

    project: one(projectTable, {
      fields: [projectReviews.projectId],
      references: [projectTable.id],
    }),
  }
})
