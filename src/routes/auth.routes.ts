import express from 'express'
import {login, logoutUser, register} from '../controller/auth.controller.ts'

const router = express()

router.post('/register', register)
router.post('/login', login)
router.post('/logout', logoutUser)

export default router
