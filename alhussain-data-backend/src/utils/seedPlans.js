// Run with: npm run seed-plans
// Refreshes dataPlans + tvPlans from src/data/dembossPlans.js (regenerate that
// file from a fresh CSV export whenever Demboss changes their plan list/IDs).
import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Pricing from '../models/Pricing.js'
import { DATA_PLANS, CABLE_PLANS } from '../data/dembossPlans.js'

const run = async () => {
  await connectDB()
  let pricing = await Pricing.findOne()
  if (!pricing) pricing = new Pricing({ dataPlans: [], tvPlans: [] })

  pricing.dataPlans = DATA_PLANS
  pricing.tvPlans = CABLE_PLANS
  await pricing.save()

  console.log(`✅ Refreshed ${DATA_PLANS.length} data plans and ${CABLE_PLANS.length} TV plans.`)
  console.log('   Note: this overwrites any manually-edited selling prices for these plans.')
  console.log('   Re-apply your margin adjustments in Admin → Pricing after running this.')

  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Failed:', err.message)
  process.exit(1)
})
