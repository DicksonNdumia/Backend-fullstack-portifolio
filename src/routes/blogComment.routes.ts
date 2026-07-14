import express from 'express'
import { protect } from '../middleware/auth/protect'
import {
  addBlogComment,
  deleteBlogComment,
  getBlogCommentById,
  getBlogComments,
  updateBlogComment,
} from '../controller/blogComments.controller'

const router = express.Router()

router.post('/add/:blogId', protect, addBlogComment)
router.get('/', getBlogComments)
router.get('/:id', protect, getBlogCommentById)
router.delete('/:id', protect, deleteBlogComment)
router.put('/:id', protect, updateBlogComment)

export default router
