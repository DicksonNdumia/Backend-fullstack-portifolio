import express from 'express'
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from '../controller/blogData.controller'
import { protect } from '../middleware/auth/protect'

const router = express.Router()

router.post('/', protect, createBlog)
router.get('/', getBlogs)
router.get('/:id', protect, getBlogById)
router.put('/:id', protect, updateBlog)
router.delete('/:id', protect, deleteBlog)

export default router
