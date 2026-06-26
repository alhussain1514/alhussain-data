import 'dotenv/config'
import { connectDB } from '../config/db.js'
import Pricing from '../models/Pricing.js'
import mongoose from 'mongoose'

const DATA_PLANS = [
  // MTN SME (network 1)
  { id: 'mtn-1', name: '1GB', duration: '7 Days', network: 'MTN', costPrice: 435, sellingPrice: 480, providerPlanId: 207 },
  { id: 'mtn-2', name: '1GB', duration: '30 Days', network: 'MTN', costPrice: 640, sellingPrice: 700, providerPlanId: 2 },
  { id: 'mtn-3', name: '2GB', duration: '30 Days', network: 'MTN', costPrice: 1180, sellingPrice: 1300, providerPlanId: 3 },
  { id: 'mtn-4', name: '3GB', duration: '30 Days', network: 'MTN', costPrice: 1720, sellingPrice: 1900, providerPlanId: 4 },
  { id: 'mtn-5', name: '5GB', duration: '30 Days', network: 'MTN', costPrice: 2200, sellingPrice: 2400, providerPlanId: 5 },

  // GLO (network 2)
  { id: 'glo-1', name: '1GB', duration: '1 Day', network: 'GLO', costPrice: 345, sellingPrice: 380, providerPlanId: 258 },
  { id: 'glo-2', name: '500MB', duration: '30 Days', network: 'GLO', costPrice: 223, sellingPrice: 260, providerPlanId: 71 },
  { id: 'glo-3', name: '1GB', duration: '30 Days', network: 'GLO', costPrice: 445, sellingPrice: 500, providerPlanId: 29 },
  { id: 'glo-4', name: '2GB', duration: '30 Days', network: 'GLO', costPrice: 890, sellingPrice: 980, providerPlanId: 30 },
  { id: 'glo-5', name: '5GB', duration: '30 Days', network: 'GLO', costPrice: 1490, sellingPrice: 1650, providerPlanId: 219 },

  // AIRTEL SME (network 3)
  { id: 'air-1', name: '1.5GB', duration: '1 Day', network: 'AIRTEL', costPrice: 475, sellingPrice: 520, providerPlanId: 101 },
  { id: 'air-2', name: '10GB', duration: '30 Days', network: 'AIRTEL', costPrice: 8450, sellingPrice: 9200, providerPlanId: 105 },
  { id: 'air-3', name: '13GB', duration: '30 Days', network: 'AIRTEL', costPrice: 5625, sellingPrice: 6200, providerPlanId: 125 },
  { id: 'air-4', name: '35GB', duration: '30 Days', network: 'AIRTEL', costPrice: 11645, sellingPrice: 12700, providerPlanId: 126 },
  { id: 'air-5', name: '60GB', duration: '30 Days', network: 'AIRTEL', costPrice: 14970, sellingPrice: 16300, providerPlanId: 170 },

  // 9MOBILE (network 4)
  { id: '9m-1', name: '40MB', duration: '1 Day', network: '9MOBILE', costPrice: 49, sellingPrice: 60, providerPlanId: 185 },
  { id: '9m-2', name: '2GB', duration: '30 Days', network: '9MOBILE', costPrice: 990, sellingPrice: 1100, providerPlanId: 190 },
  { id: '9m-3', name: '4.5GB', duration: '30 Days', network: '9MOBILE', costPrice: 1985, sellingPrice: 2200, providerPlanId: 192 },
  { id: '9m-4', name: '6.2GB', duration: '30 Days', network: '9MOBILE', costPrice: 2972, sellingPrice: 3300, providerPlanId: 194 },
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
  console.log(`✅ Done — ${DATA_PLANS.length} data plans, ${TV_PLANS.length} TV plans`)
  await mongoose.disconnect()
  process.exit(0)
}

update().catch(err => { console.error('❌', err.message); process.exit(1) })
