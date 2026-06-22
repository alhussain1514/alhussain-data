import express from 'express'
import { protect, adminOnly } from '../middleware/auth.js'
import {
  getUsers,
  getUserById,
  fundUser,
  updateUserStatus,
  getAllTransactions,
  getDashboardStats,
  updatePricing,
} from '../controllers/admin.controller.js'

const router = express.Router()

// Every route here requires a logged-in admin
router.use(protect, adminOnly)

router.get('/stats', getDashboardStats)

router.get('/users', getUsers)
router.get('/users/:id', getUserById)
router.post('/users/:id/fund', fundUser)
router.put('/users/:id/status', updateUserStatus)

router.get('/transactions', getAllTransactions)

router.put('/pricing', updatePricing)

export default router
