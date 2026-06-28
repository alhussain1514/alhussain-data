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

const RAW_PLANS = [
  ['MTN', 48, '500MB', 300],
  ['MTN', 50, '1GB', 400],
  ['MTN', 53, '2GB', 900],
  ['MTN', 55, '3GB', 1200],
  ['MTN', 57, '5GB', 1400],
  ['GLO', 72, '750MB', 220],
  ['GLO', 73, '1.5GB', 330],
  ['GLO', 74, '2.5GB', 550],
  ['GLO', 76, '10GB', 2100],
  ['AIRTEL', 94, '150MB', 90],
  ['AIRTEL', 100, '300MB', 200],
  ['AIRTEL', 97, '600MB', 300],
  ['AIRTEL', 95, '1.5GB', 450],
  ['AIRTEL', 96, '2GB', 650],
  ['AIRTEL', 98, '3GB', 900],
  ['AIRTEL', 99, '10GB', 3300],
  ['AIRTEL', 101, '35GB', 11000],
  ['AIRTEL', 102, '60GB', 15500],
  ['9MOBILE', 81, '100MB', 80],
  ['9MOBILE', 82, '500MB', 160],
  ['9MOBILE', 83, '1GB', 300],
  ['9MOBILE', 84, '2GB', 600],
  ['9MOBILE', 85, '3GB', 900],
  ['9MOBILE', 86, '4GB', 1200],
  ['9MOBILE', 87, '5GB', 1500],
  ['9MOBILE', 88, '10GB', 3000],
  ['9MOBILE', 89, '15GB', 4500],
  ['9MOBILE', 90, '20GB', 6000],
]

const dataPlans = RAW_PLANS.map(([network, providerPlanId, size, costPrice]) => ({
  id: `${network.toLowerCase()}-${providerPlanId}`,
  name: size,
  duration: '30 Days',
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
  console.log(`Loaded ${dataPlans.length} real data plans`)
  dataPlans.forEach((p) => console.log(`${p.network} ${p.name} - cost N${p.costPrice}, sell N${p.sellingPrice}`))
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
