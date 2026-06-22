import express from 'express'
import { paystackWebhook } from '../controllers/wallet.controller.js'

const router = express.Router()

// Mounted with express.raw() in server.js so we can verify the HMAC signature
// against the exact raw bytes Paystack sent (JSON.parse would mutate formatting).
router.post('/', paystackWebhook)

export default router
