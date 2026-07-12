import express from 'express'
import { protect } from '../middleware/auth.js'
import {
  getDataPlans,
  buyData,
  buyAirtime,
  verifyMeter,
  payElectricity,
  getTvPlans,
  verifyDecoder,
  payTV,
  getExamPinPrices,
  buyResultChecker,
} from '../controllers/vtu.controller.js'

const router = express.Router()

router.get('/data/plans/:network', protect, getDataPlans)
router.post('/data/buy', protect, buyData)

router.post('/airtime/buy', protect, buyAirtime)

router.post('/electricity/verify', protect, verifyMeter)
router.post('/electricity/pay', protect, payElectricity)

router.get('/tv/plans/:provider', protect, getTvPlans)
router.post('/tv/verify', protect, verifyDecoder)
router.post('/tv/pay', protect, payTV)

router.get('/result-checker/prices', protect, getExamPinPrices)
router.post('/result-checker/buy', protect, buyResultChecker)

export default router
