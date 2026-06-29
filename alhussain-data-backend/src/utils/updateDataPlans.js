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

// Source: SundayNetwork support, confirmed via WhatsApp June 29 2026.
// Using cheapest available validity per size (1 week for MTN, 7 days for
// GLO where available; GLO 500MB and 10GB only come in 30-day).
// AIRTEL and 9MOBILE still excluded — not confirmed working yet.
const RAW_PLANS = [
  ['MTN', 158, '500MB', '1 Week', 350],
  ['MTN', 6, '1GB', '1 Week', 450],
  ['MTN', 10, '2GB', '1 Week', 750],
  ['MTN', 162, '3GB', '1 Week', 1000],
  ['MTN', 161, '5GB', '1 Week', 1350],

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
  console.log(`Loaded ${dataPlans.length} confirmed-working data plans (cheapest validity, MTN + GLO)`)
  dataPlans.forEach((p) => console.log(`${p.network} ${p.name} (${p.duration}) - cost N${p.costPrice}, sell N${p.sellingPrice}`))
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
