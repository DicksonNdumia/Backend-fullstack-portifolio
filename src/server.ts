import 'dotenv/config'
import express from 'express'

import cookieParser from 'cookie-parser'
import { handleError } from './middleware/error/error.ts'
import { logger } from './middleware/log/isLogged.ts'
import { limiter } from './utils/helper/limit.ts'
import { addRespondToResponse } from './middleware/res/response.ts'
import authRoutes from './routes/auth.routes.ts'
import devRoutes from './routes/devData.routes.ts'
import devLanguage from './routes/devLanguage.routes.ts'
import toolsRoutes from './routes/tools.routes.ts'
import projectRoutes from './routes/project.routes.ts'
import blogDataRoutes from './routes/blogData.routes.ts'
import BlogCommentRoutes from './routes/blogComment.routes.ts'
import ReviewCommentRoutes from './routes/projectReviews.routes.ts'
import { RouteNotFoundError } from './error/customError.ts'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cookieParser())
app.use(express.json())
app.use(logger)

app.use(limiter)
app.use(addRespondToResponse)

app.use('/api/auth', authRoutes)
app.use('/api/dev', devRoutes)
app.use('/api/dev/language', devLanguage)
app.use('/api/v1/tools', toolsRoutes)
app.use('/api/v1/projects', projectRoutes)
app.use('/api/v1/blogData', blogDataRoutes)
app.use('/api/v1/blogComment', BlogCommentRoutes)
app.use('/api/v1/reviews', ReviewCommentRoutes)

app.use((req, _res, next) => next(new RouteNotFoundError(req.originalUrl)))
app.use(handleError)

app.listen(PORT, () => {
  console.log(`App is listening on port: ${PORT} ❤️`)
})
