import express from 'express'
import { authorize, protect } from '../middleware/auth/protect'
import {
  addProject,
  deleteProject,
  getProjectById,
  getProjects,
  updateProject,
} from '../controller/project.controller'

const router = express.Router()

router.post('/add', protect, authorize('admin'), addProject)
router.get('/', getProjects)
router.get('/:id', getProjectById)
router.put('/:id', protect, authorize('admin'), updateProject)
router.delete('/:id', protect, authorize('admin'), deleteProject)

export default router
