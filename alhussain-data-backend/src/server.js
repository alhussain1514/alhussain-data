import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import { connectDB } from './config/db.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

import authRoutes from './routes/auth.routes.js'
import walletRoutes from './routes/wallet.routes.js'
import vtuRoutes from './routes/vtu.routes.js'
import referralRoutes from './routes/referral.routes.js'
import adminRoutes from './routes/admin.routes.js'
import webhookRoutes from './routes/webhook.routes.js'

const app = express()

await connectDB()

// ── Security & logging ──
app.use(helmet())
app.use(cors({ origin: true, credentials: true }))
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'))

// Rate limit: protects auth + VTU purchase endpoints from abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Too many requests. Please try again shortly.' },
})
app.use('/api', apiLimiter)

// ── Paystack webhook needs the RAW body for signature verification,
//    so it's mounted BEFORE express.json() with its own raw parser ──
app.use(
  '/api/wallet/paystack/webhook',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    req.rawBody = req.body // Buffer, used for HMAC check
    req.body = JSON.parse(req.body.toString('utf8')) // parsed JSON for the controller
    next()
  },
  webhookRoutes
)

// ── Standard JSON body parsing for everything else ──
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── Health check ──
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// ── Routes ──
app.use('/api/auth', authRoutes)
app.use('/api/wallet', walletRoutes)
app.use('/api/vtu', vtuRoutes)
app.use('/api/referral', referralRoutes)
app.use('/api/admin', adminRoutes)

// ── Errors ──
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 AL-HUSSAIN DATA API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
})
