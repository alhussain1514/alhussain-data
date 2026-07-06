import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from './src/config/db.js'
import Transaction from './src/models/Transaction.js'

const run = async () => {
  await connectDB()
  const tx = await Transaction.findOne({ status: 'failed' }).sort({ createdAt: -1 })
  if (!tx) {
    console.log('No failed transactions found.')
  } else {
    console.log('--- Most recent failed transaction ---')
    console.log('Type:', tx.type)
    console.log('Description:', tx.description)
    console.log('Created:', tx.createdAt)
    console.log('Provider response:', JSON.stringify(tx.providerResponse, null, 2))
  }
  await mongoose.disconnect()
  process.exit(0)
}

run().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
