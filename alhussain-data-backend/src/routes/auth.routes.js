import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/register', register)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)

export default router
