import express from 'express'
import { authorize, protect } from '../middleware/auth/protect.ts'
import {
  addTools,
  deleteTool,
  getToolById,
  getTools,
  updateTool,
} from '../controller/tools.controller.ts'

const router = express.Router()

router.post('/add', protect, authorize('admin'), addTools)
router.get('/', getTools)
router.get('/:id', protect, getToolById)
router.put('/:id', protect, authorize('admin'), updateTool)
router.delete('/:id', protect, authorize('admin'), deleteTool)

export default router
