import type { RequestHandler } from 'express'

export const addRespondToResponse: RequestHandler = (_req, res, next) => {
  res.respond = (data, statusCode = 200): void => {
    res.status(statusCode).json(data)
  }

  next()
}
