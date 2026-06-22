import mongoose from 'mongoose'

const dataPlanSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  duration: { type: String, required: true },
  network: { type: String, enum: ['MTN', 'AIRTEL', 'GLO', '9MOBILE'], required: true },
  costPrice: { type: Number, required: true },  // what we pay the VTU provider
  sellingPrice: { type: Number, required: true }, // what the user pays
  providerPlanId: { type: String }, // ID used when calling the VTU provider's API
  active: { type: Boolean, default: true },
})

const tvPlanSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  provider: { type: String, enum: ['dstv', 'gotv', 'startimes'], required: true },
  sellingPrice: { type: Number, required: true },
  providerPlanId: { type: String },
  active: { type: Boolean, default: true },
})

const pricingSchema = new mongoose.Schema(
  {
    dataPlans: [dataPlanSchema],
    tvPlans: [tvPlanSchema],
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
