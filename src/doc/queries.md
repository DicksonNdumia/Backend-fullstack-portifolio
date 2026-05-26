# Database Schema Queries Documentation (Drizzle ORM)

## Overview
This document describes the database schema, tables, and relationships for the system built using Drizzle ORM with PostgreSQL.

---

## Tables

### 1. Users
**Table:** `users`

- id (serial, PK)
- name (varchar 255)
- email (varchar 255, unique)
- password (varchar 255)
- role (enum: admin | user, default: user)
- createdAt (timestamp)
- updatedAt (timestamp)

**Indexes:**
- email_idx on email
- role_idx on role

---

### 2. Tools
**Table:** `tools`

- id (serial, PK)
- name (varchar 255, unique)
- image (varchar 255)
- description (varchar 255)
- createdAt
- updatedAt

---

### 3. Projects
**Table:** `projects`

- id (serial, PK)
- name (varchar 255)
- description (varchar 255)
- shortDescription (varchar 255)
- demo (varchar 255)
- github (varchar 255)
- toolsId (FK → tools.id)
- userId (FK → users.id, nullable)
- languageId (FK → languages.id)
- features (text)
- hostingPlatforms (varchar 255)
- createdAt
- updatedAt

---

### 4. Dev Data
**Table:** `devData`

- id (serial, PK)
- name (varchar 255)
- email (varchar 255, unique)
- phone (varchar 255, unique)
- dateOfBirth (timestamp)
- cv (varchar 255)
- userId (FK → users.id)
- createdAt
- updatedAt

---

### 5. Languages
**Table:** `languages`

- id (serial, PK)
- name (varchar 255)
- proficiency (beginner | intermediate | expert, default: beginner)
- experience (text)
- createdAt
- updatedAt

---

### 6. Blogs
**Table:** `blogs`

- id (serial, PK)
- name (varchar 255)
- description (varchar 255)
- userId (FK → users.id, nullable)
- createdAt
- updatedAt

---

### 7. Blog Comments
**Table:** `blogComments`

- id (serial, PK)
- comment (text)
- userId (FK → users.id)
- blogId (FK → blogs.id)
- createdAt
- updatedAt

---

### 8. Project Reviews
**Table:** `projectReviews`

- id (serial, PK)
- rating (integer)
- comment (text)
- userId (FK → users.id)
- projectId (FK → projects.id)
- createdAt
- updatedAt

**Indexes:**
- review_user_idx on userId
- review_project_idx on projectId

---

## Relationships

### Users
- has one DevData
- has many Projects
- has many Blogs
- has many BlogComments
- has many ProjectReviews

### Projects
- belongs to Tool
- belongs to Language
- belongs to User
- has many ProjectReviews

### Blogs
- belongs to User
- has many BlogComments

### BlogComments
- belongs to User
- belongs to Blog

### ProjectReviews
- belongs to User
- belongs to Project

### Tools
- has many Projects

### Languages
- has many Projects

---

## Example Queries (Drizzle ORM)

### Get user with projects
```ts
db.query.userTable.findMany({
  with: {
    projects: true,
  },
})
```

### Get project with reviews and tool
```ts
db.query.projectTable.findMany({
  with: {
    tool: true,
    reviews: true,
  },
})
```

### Create a new project
```ts
await db.insert(projectTable).values({
  name: "My App",
  description: "Cool project",
  shortDescription: "Cool app",
  demo: "url",
  github: "url",
  toolsId: 1,
  languageId: 1,
  features: "fast, scalable",
  hostingPlatforms: "Vercel",
})
```

### Get blog with comments
```ts
db.query.blogData.findMany({
  with: {
    comments: true,
  },
})
```
