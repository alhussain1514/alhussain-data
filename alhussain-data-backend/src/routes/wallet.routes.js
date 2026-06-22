import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getBalance,
  initiateFunding,
  verifyFunding,
  getTransactions,
  withdraw,
} from '../controllers/wallet.controller.js'

const router = express.Router()

router.get('/balance', protect, getBalance)
router.post('/fund/initiate', protect, initiateFunding)
router.get('/fund/verify/:reference', protect, verifyFunding)
router.get('/transactions', protect, getTransactions)
router.post('/withdraw', protect, withdraw)

export default router
