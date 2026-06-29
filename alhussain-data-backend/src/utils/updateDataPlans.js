import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import Pricing from '../models/Pricing.js'

const MARKUP_PERCENT = 8
const MIN_MARKUP = 20

function sellingPrice(cost) {
  const raw = cost + Math.max(MIN_MARKUP, cost * (MARKUP_PERCENT / 100))
  return Math.ceil(raw / 10) * 10
}

// 500MB (1 Week, id 158) removed - confirmed unavailable on SundayNetwork.
// Added 3GB and 5GB "1 Month" options (ids 8, 5) alongside existing 1 Week ones.
const RAW_PLANS = [
  ['MTN', 6, '1GB', '1 Week', 450],
  ['MTN', 10, '2GB', '1 Week', 750],
  ['MTN', 162, '3GB', '1 Week', 1000],
  ['MTN', 8, '3GB', '1 Month', 1100],
  ['MTN', 161, '5GB', '1 Week', 1350],
  ['MTN', 5, '5GB', '1 Month', 1400],

  ['GLO', 61, '500MB', '30 Days', 300],
  ['GLO', 63, '1GB', '7 Days', 400],
  ['GLO', 67, '3GB', '7 Days', 1050],
  ['GLO', 69, '5GB', '7 Days', 1750],
  ['GLO', 71, '10GB', '30 Days', 4600],
]

const dataPlans = RAW_PLANS.map(([network, providerPlanId, size, duration, costPrice]) => ({
  id: `${network.toLowerCase()}-${providerPlanId}`,
  name: size,
  duration,
  network,
  costPrice,
  sellingPrice: sellingPrice(costPrice),
  providerPlanId: String(providerPlanId),
  active: true,
}))

const run = async () => {
  await connectDB()
  let pricing = await Pricing.findOne()
  if (!pricing) pricing = new Pricing({ dataPlans: [], tvPlans: [] })
  pricing.dataPlans = dataPlans
  await pricing.save()
  console.log(`Loaded ${dataPlans.length} plans`)
  dataPlans.forEach((p) => console.log(`${p.network} ${p.name} (${p.duration}) - cost N${p.costPrice}, sell N${p.sellingPrice}`))
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
