import express from 'express'
import { authorize, protect } from '../middleware/auth/protect.ts'
import { addTools, getTools } from '../controller/tools.controller.ts'

const router = express.Router()

router.post('/add', protect, authorize('admin'), addTools)
router.get('/', getTools)

export default router
