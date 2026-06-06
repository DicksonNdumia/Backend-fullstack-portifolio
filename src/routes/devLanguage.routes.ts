import express from 'express'
import { authorize, protect } from '../middleware/auth/protect'
import {
  addDevLanguages,
  getDevLanguages,
} from '../controller/languages.controller'

const router = express.Router()

router.post('/:userId', protect, authorize('admin'), addDevLanguages)
router.get('/', getDevLanguages)

export default router
