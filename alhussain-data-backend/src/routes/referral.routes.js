import express from 'express'
import { protect } from '../middleware/auth.js'
import { getReferralInfo, getReferralList } from '../controllers/referral.controller.js'

const router = express.Router()

router.get('/info', protect, getReferralInfo)
router.get('/list', protect, getReferralList)

export default router
