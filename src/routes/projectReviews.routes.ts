import express from 'express'
import { protect } from '../middleware/auth/protect'
import { addReview } from '../controller/projectReviews.controller'

const router = express.Router()

router.post('/:id', protect, addReview)

export default router
