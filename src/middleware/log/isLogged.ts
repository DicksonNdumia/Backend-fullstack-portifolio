import chalk from 'chalk'
import type { Request, Response, NextFunction } from 'express'

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  res.on('finish', () => {
    const durationTaken = Date.now() - start
    console.log('durationTaken: ', durationTaken)
    const statusCodeColor =
      res.statusCode >= 500
        ? chalk.red
        : res.statusCode >= 400
          ? chalk.yellow
          : res.statusCode >= 404
            ? chalk.red
            : res.statusCode >= 403
              ? chalk.red
              : chalk.green

    const httpMethodColor =
      req.method === 'GET'
        ? chalk.blue
        : req.method === 'POST'
          ? chalk.magenta
          : req.method === 'PUT'
            ? chalk.cyan
            : req.method === 'DELETE'
              ? chalk.red
              : chalk.white

    console.log(
      `${httpMethodColor(req.method)} ${chalk.white(`http://localhost:3000${req.url}`)}` +
        statusCodeColor(res.statusCode) +
        chalk.gray(`- ${durationTaken}ms`),
    )
  })
  next()
}
