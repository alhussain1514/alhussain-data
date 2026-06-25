import 'dotenv/config'
import { connectDB } from '../config/db.js'
import Pricing from '../models/Pricing.js'
import mongoose from 'mongoose'

const DATA_PLANS = [
  // ── MTN ──
  { id: 'mtn-1', name: '1GB', duration: '1 Day', network: 'MTN', costPrice: 270, sellingPrice: 310, providerPlanId: 249 },
  { id: 'mtn-2', name: '500MB', duration: '7 Days', network: 'MTN', costPrice: 355, sellingPrice: 400, providerPlanId: 97 },
  { id: 'mtn-3', name: '1GB', duration: '7 Days', network: 'MTN', costPrice: 425, sellingPrice: 470, providerPlanId: 206 },
  { id: 'mtn-4', name: '500MB', duration: '30 Days', network: 'MTN', costPrice: 495, sellingPrice: 550, providerPlanId: 165 },
  { id: 'mtn-5', name: '1.2GB', duration: '30 Days', network: 'MTN', costPrice: 499, sellingPrice: 560, providerPlanId: 139 },
  { id: 'mtn-6', name: '1GB', duration: '30 Days', network: 'MTN', costPrice: 640, sellingPrice: 720, providerPlanId: 2 },

  // ── AIRTEL ──
  { id: 'air-1', name: '1.5GB', duration: '30 Days', network: 'AIRTEL', costPrice: 1495, sellingPrice: 1650, providerPlanId: 104 },
  { id: 'air-2', name: '3GB', duration: '30 Days', network: 'AIRTEL', costPrice: 1970, sellingPrice: 2150, providerPlanId: 176 },
  { id: 'air-3', name: '4GB', duration: '30 Days', network: 'AIRTEL', costPrice: 2485, sellingPrice: 2750, providerPlanId: 203 },
  { id: 'air-4', name: '8GB', duration: '30 Days', network: 'AIRTEL', costPrice: 3010, sellingPrice: 3300, providerPlanId: 205 },
  { id: 'air-5', name: '10GB', duration: '30 Days', network: 'AIRTEL', costPrice: 3450, sellingPrice: 3800, providerPlanId: 105 },
  { id: 'air-6', name: '25GB', duration: '30 Days', network: 'AIRTEL', costPrice: 7950, sellingPrice: 8700, providerPlanId: 233 },

  // ── GLO ──
  { id: 'glo-1', name: '500MB', duration: '30 Days', network: 'GLO', costPrice: 223, sellingPrice: 260, providerPlanId: 71 },
  { id: 'glo-2', name: '1GB', duration: '30 Days', network: 'GLO', costPrice: 445, sellingPrice: 500, providerPlanId: 29 },
  { id: 'glo-3', name: '2GB', duration: '30 Days', network: 'GLO', costPrice: 890, sellingPrice: 980, providerPlanId: 30 },
  { id: 'glo-4', name: '2.6GB', duration: '30 Days', network: 'GLO', costPrice: 995, sellingPrice: 1100, providerPlanId: 218 },
  { id: 'glo-5', name: '3.9GB', duration: '30 Days', network: 'GLO', costPrice: 990, sellingPrice: 1100, providerPlanId: 251 },
  { id: 'glo-6', name: '5GB', duration: '30 Days', network: 'GLO', costPrice: 1490, sellingPrice: 1650, providerPlanId: 219 },

  // ── 9MOBILE ──
  { id: '9m-1', name: '40MB', duration: '1 Day', network: '9MOBILE', costPrice: 49, sellingPrice: 60, providerPlanId: 185 },
  { id: '9m-2', name: '83MB', duration: '1 Day', network: '9MOBILE', costPrice: 99, sellingPrice: 120, providerPlanId: 186 },
  { id: '9m-3', name: '2GB', duration: '30 Days', network: '9MOBILE', costPrice: 990, sellingPrice: 1100, providerPlanId: 190 },
  { id: '9m-4', name: '2.3GB', duration: '30 Days', network: '9MOBILE', costPrice: 1190, sellingPrice: 1300, providerPlanId: 191 },
  { id: '9m-5', name: '4.5GB', duration: '30 Days', network: '9MOBILE', costPrice: 1985, sellingPrice: 2200, providerPlanId: 192 },
  { id: '9m-6', name: '6.2GB', duration: '30 Days', network: '9MOBILE', costPrice: 2972, sellingPrice: 3300, providerPlanId: 194 },
]

const TV_PLANS = [
  { id: 'd1', name: 'Padi', provider: 'dstv', sellingPrice: 2950, providerPlanId: 'dstv-padi' },
  { id: 'd2', name: 'Yanga', provider: 'dstv', sellingPrice: 5100, providerPlanId: 'dstv-yanga' },
  { id: 'd3', name: 'Confam', provider: 'dstv', sellingPrice: 6200, providerPlanId: 'dstv-confam' },
  { id: 'd4', name: 'Compact', provider: 'dstv', sellingPrice: 10500, providerPlanId: 'dstv-compact' },
  { id: 'd5', name: 'Compact+', provider: 'dstv', sellingPrice: 16600, providerPlanId: 'dstv-compact-plus' },
  { id: 'd6', name: 'Premium', provider: 'dstv', sellingPrice: 24500, providerPlanId: 'dstv-premium' },
  { id: 'g1', name: 'Smallie', provider: 'gotv', sellingPrice: 1575, providerPlanId: 'gotv-smallie' },
  { id: 'g2', name: 'Jinja', provider: 'gotv', sellingPrice: 2715, providerPlanId: 'gotv-jinja' },
  { id: 'g3', name: 'Jolli', provider: 'gotv', sellingPrice: 4100, providerPlanId: 'gotv-jolli' },
  { id: 'g4', name: 'Max', provider: 'gotv', sellingPrice: 5700, providerPlanId: 'gotv-max' },
  { id: 'g5', name: 'Supa', provider: 'gotv', sellingPrice: 9600, providerPlanId: 'gotv-supa' },
  { id: 's1', name: 'Nova', provider: 'startimes', sellingPrice: 900, providerPlanId: 'startimes-nova' },
  { id: 's2', name: 'Basic', provider: 'startimes', sellingPrice: 2000, providerPlanId: 'startimes-basic' },
  { id: 's3', name: 'Smart', provider: 'startimes', sellingPrice: 2800, providerPlanId: 'startimes-smart' },
  { id: 's4', name: 'Classic', provider: 'startimes', sellingPrice: 3200, providerPlanId: 'startimes-classic' },
  { id: 's5', name: 'Super', provider: 'startimes', sellingPrice: 4200, providerPlanId: 'startimes-super' },
]

const update = async () => {
  await connectDB()
  await Pricing.deleteMany({})
  await Pricing.create({ dataPlans: DATA_PLANS, tvPlans: TV_PLANS })
  console.log(`✅ Database updated — ${DATA_PLANS.length} data plans, ${TV_PLANS.length} TV plans`)
  await mongoose.disconnect()
  process.exit(0)
}

update().catch(err => { console.error('❌ Failed:', err.message); process.exit(1) })
