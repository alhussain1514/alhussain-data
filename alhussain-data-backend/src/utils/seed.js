import 'dotenv/config'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'
import Pricing from '../models/Pricing.js'
import mongoose from 'mongoose'

const ADMIN = {
  name: 'AL-HUSSAIN Admin',
  phone: '08000000000',
  email: 'admin@alhussaindata.ng',
  password: 'Admin@12345', // change immediately after first login in production
  role: 'admin',
}

const DATA_PLANS = [
  { id: 'mtn-1', name: '500MB', duration: '1 Day', network: 'MTN', costPrice: 130, sellingPrice: 150, providerPlanId: 'mtn-500mb-1day' },
  { id: 'mtn-2', name: '1GB', duration: '1 Day', network: 'MTN', costPrice: 220, sellingPrice: 250, providerPlanId: 'mtn-1gb-1day' },
  { id: 'mtn-3', name: '2GB', duration: '30 Days', network: 'MTN', costPrice: 750, sellingPrice: 850, providerPlanId: 'mtn-2gb-30day' },
  { id: 'mtn-4', name: '5GB', duration: '30 Days', network: 'MTN', costPrice: 1350, sellingPrice: 1500, providerPlanId: 'mtn-5gb-30day' },
  { id: 'mtn-5', name: '10GB', duration: '30 Days', network: 'MTN', costPrice: 2250, sellingPrice: 2500, providerPlanId: 'mtn-10gb-30day' },
  { id: 'mtn-6', name: '20GB', duration: '30 Days', network: 'MTN', costPrice: 4100, sellingPrice: 4500, providerPlanId: 'mtn-20gb-30day' },

  { id: 'air-1', name: '500MB', duration: '1 Day', network: 'AIRTEL', costPrice: 120, sellingPrice: 140, providerPlanId: 'airtel-500mb-1day' },
  { id: 'air-2', name: '1GB', duration: '7 Days', network: 'AIRTEL', costPrice: 270, sellingPrice: 300, providerPlanId: 'airtel-1gb-7day' },
  { id: 'air-3', name: '2GB', duration: '30 Days', network: 'AIRTEL', costPrice: 720, sellingPrice: 800, providerPlanId: 'airtel-2gb-30day' },
  { id: 'air-4', name: '5GB', duration: '30 Days', network: 'AIRTEL', costPrice: 1260, sellingPrice: 1400, providerPlanId: 'airtel-5gb-30day' },
  { id: 'air-5', name: '10GB', duration: '30 Days', network: 'AIRTEL', costPrice: 2160, sellingPrice: 2400, providerPlanId: 'airtel-10gb-30day' },
  { id: 'air-6', name: '25GB', duration: '30 Days', network: 'AIRTEL', costPrice: 4500, sellingPrice: 5000, providerPlanId: 'airtel-25gb-30day' },

  { id: 'glo-1', name: '1GB', duration: '1 Day', network: 'GLO', costPrice: 180, sellingPrice: 200, providerPlanId: 'glo-1gb-1day' },
  { id: 'glo-2', name: '2.5GB', duration: '30 Days', network: 'GLO', costPrice: 630, sellingPrice: 700, providerPlanId: 'glo-2.5gb-30day' },
  { id: 'glo-3', name: '5GB', duration: '30 Days', network: 'GLO', costPrice: 1080, sellingPrice: 1200, providerPlanId: 'glo-5gb-30day' },
  { id: 'glo-4', name: '10GB', duration: '30 Days', network: 'GLO', costPrice: 1800, sellingPrice: 2000, providerPlanId: 'glo-10gb-30day' },
  { id: 'glo-5', name: '15GB', duration: '30 Days', network: 'GLO', costPrice: 2700, sellingPrice: 3000, providerPlanId: 'glo-15gb-30day' },

  { id: '9m-1', name: '500MB', duration: '30 Days', network: '9MOBILE', costPrice: 180, sellingPrice: 200, providerPlanId: '9mobile-500mb-30day' },
  { id: '9m-2', name: '1.5GB', duration: '30 Days', network: '9MOBILE', costPrice: 450, sellingPrice: 500, providerPlanId: '9mobile-1.5gb-30day' },
  { id: '9m-3', name: '3GB', duration: '30 Days', network: '9MOBILE', costPrice: 900, sellingPrice: 1000, providerPlanId: '9mobile-3gb-30day' },
  { id: '9m-4', name: '6GB', duration: '30 Days', network: '9MOBILE', costPrice: 1800, sellingPrice: 2000, providerPlanId: '9mobile-6gb-30day' },
]

const TV_PLANS = [
  { id: 'd1', name: 'Padi', provider: 'dstv', sellingPrice: 2500, providerPlanId: 'dstv-padi' },
  { id: 'd2', name: 'Yanga', provider: 'dstv', sellingPrice: 3500, providerPlanId: 'dstv-yanga' },
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

const seed = async () => {
  await connectDB()

  // Admin account
  const existingAdmin = await User.findOne({ phone: ADMIN.phone })
  if (!existingAdmin) {
    await User.create(ADMIN)
    console.log(`✅ Admin created — phone: ${ADMIN.phone}, password: ${ADMIN.password}`)
  } else {
    console.log('ℹ️  Admin already exists, skipping.')
  }

  // Pricing
  let pricing = await Pricing.findOne()
  if (!pricing) {
    pricing = await Pricing.create({ dataPlans: DATA_PLANS, tvPlans: TV_PLANS })
    console.log(`✅ Pricing seeded — ${DATA_PLANS.length} data plans, ${TV_PLANS.length} TV plans`)
  } else {
    console.log('ℹ️  Pricing document already exists, skipping.')
  }

  console.log('🌱 Seed complete.')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
