import mongoose from 'mongoose'

const dataPlanSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  duration: { type: String, required: true },
  network: { type: String, enum: ['MTN', 'AIRTEL', 'GLO', '9MOBILE'], required: true },
  costPrice: { type: Number, required: true },  // what we pay Demboss
  sellingPrice: { type: Number, required: true }, // what the user pays
  providerPlanId: { type: String }, // Demboss's data_plan (pId)
  planType: { type: String }, // Corporate / Gifting / SME — informational
  active: { type: Boolean, default: true },
})

const tvPlanSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  provider: { type: String, enum: ['dstv', 'gotv', 'startimes', 'showmax'], required: true },
  costPrice: { type: Number, default: 0 }, // what we pay Demboss
  sellingPrice: { type: Number, required: true },
  providerPlanId: { type: String }, // Demboss's cable_plan (cpId)
  active: { type: Boolean, default: true },
})

const examPinPriceSchema = new mongoose.Schema({
  examName: { type: String, enum: ['WAEC', 'NECO', 'JAMB', 'NABTEB'], required: true },
  sellingPrice: { type: Number, required: true },
}, { _id: false })

const pricingSchema = new mongoose.Schema(
  {
    dataPlans: [dataPlanSchema],
    tvPlans: [tvPlanSchema],
    examPinPrices: {
      type: [examPinPriceSchema],
      default: [
        { examName: 'WAEC', sellingPrice: 3600 },
        { examName: 'NECO', sellingPrice: 1500 },
        { examName: 'NABTEB', sellingPrice: 1200 },
        { examName: 'JAMB', sellingPrice: 5500 }, // placeholder — confirm real Demboss price and update here
      ],
    },
    airtimeDiscount: {
      MTN: { type: Number, default: 0 },     // percentage discount, e.g. 2 = 2% off face value
      AIRTEL: { type: Number, default: 0 },
      GLO: { type: Number, default: 0 },
      '9MOBILE': { type: Number, default: 0 },
    },
    electricityFee: { type: Number, default: 0 }, // flat service fee added to bills
  },
  { timestamps: true }
)

export default mongoose.model('Pricing', pricingSchema)
