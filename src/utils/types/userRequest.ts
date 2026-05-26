import type { Request } from 'express'
import {userTable} from "../../schema/shema.ts";

/**
 * User type defining structure of a user record in PostgreSQL
 * Since these timestamps are mostly used for database records but are not critical for authentication, we can make them optional in our User type.
 */
export interface User {
  id: number
  name: string
  email: string
  password?: string // Exclude password when returning user info
  role: string
  created_at?: Date
  updated_at?: Date
}

/**
 * Custom Express Request Type to include `user` object
 */
export interface UserRequest extends Request {
    user?: typeof userTable.$inferSelect;
}
