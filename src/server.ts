import 'dotenv/config'
import express from 'express'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { errorHandler } from './middleware/error/erroHandler.ts'
import { logger } from './middleware/log/isLogged.ts'
import { limiter } from './utils/helper/limit.ts'

import authRoutes from './routes/auth.routes.ts'

const app = express()
const PORT = process.env.PORT || 5000

app.use(cookieParser())
app.use(express.json())
app.use(logger)

app.use(limiter)

app.use(errorHandler)

app.use('/api/auth', authRoutes)

app.listen(PORT, () => {
  console.log(`App is listening on port: ${PORT} ❤️`)
})
