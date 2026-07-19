import express from 'express'
import { authorize, protect } from '../middleware/auth/protect'
import {
  addDevLanguages,
  deleteDevLanguage,
  getDevLAnguageById,
  getDevLanguages,
} from '../controller/languages.controller'

const router = express.Router()

router.post('/:userId', protect, authorize('admin'), addDevLanguages)
router.get('/', getDevLanguages)
router.get('/:id', protect, getDevLAnguageById)
router.delete('/:id', protect, authorize('admin'), deleteDevLanguage)

export default router
