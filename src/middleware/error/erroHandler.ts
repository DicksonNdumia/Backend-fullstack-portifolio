import chalk from 'chalk'
import type { Request, Response, NextFunction } from 'express'

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = res.statusCode || 500
  console.error(chalk.red(`[Error] ${err.message}`))

  res.status(statusCode).json({
    success: false,
    message: err.message || 'INTERNAL SERVER ERROR',
  })
  next()
}
