import express from 'express'
import { authorize, protect } from '../middleware/auth/protect.ts'
import {
  deleteDevDetails,
  devDetails,
  getDevDetails,
} from '../controller/devData.controller.ts'

const router = express.Router()

router.post('/add/dev/:userId', protect, authorize('admin'), devDetails)
router.get('/details/:id', getDevDetails)
router.delete('/:id', protect, authorize('admin'), deleteDevDetails)

export default router
