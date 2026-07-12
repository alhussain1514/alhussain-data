import 'dotenv/config'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'
import Pricing from '../models/Pricing.js'
import { DATA_PLANS, CABLE_PLANS } from '../data/dembossPlans.js'
import mongoose from 'mongoose'

const ADMIN = {
  name: process.env.SEED_ADMIN_NAME || 'AL-HUSSAIN Admin',
  phone: process.env.SEED_ADMIN_PHONE || '08000000000',
  email: process.env.SEED_ADMIN_EMAIL || 'admin@alhussaindata.ng',
  password: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345', // change immediately after first login in production
  role: 'admin',
}

const seed = async () => {
  await connectDB()

  // Admin account
  const existingAdmin = await User.findOne({ phone: ADMIN.phone })
  if (!existingAdmin) {
    await User.create(ADMIN)
    console.log(`✅ Admin created — phone: ${ADMIN.phone}, password: ${ADMIN.password}`)
    console.log('   ⚠️  Log in and change this password immediately.')
  } else {
    console.log('ℹ️  Admin already exists, skipping.')
  }

  // Pricing — seeded from the real Demboss plan lists
  let pricing = await Pricing.findOne()
  if (!pricing) {
    pricing = await Pricing.create({ dataPlans: DATA_PLANS, tvPlans: CABLE_PLANS })
    console.log(`✅ Pricing seeded — ${DATA_PLANS.length} data plans, ${CABLE_PLANS.length} TV plans`)
  } else {
    console.log('ℹ️  Pricing document already exists, skipping. Run `npm run seed-plans` to refresh plan lists.')
  }

  console.log('🌱 Seed complete.')
  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
