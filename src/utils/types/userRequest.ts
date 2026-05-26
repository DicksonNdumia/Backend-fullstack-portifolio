import type { Request } from 'express'
import { userTable } from '../../schema/shema.ts'

export interface UserRequest extends Request {
  user?: typeof userTable.$inferSelect
}
