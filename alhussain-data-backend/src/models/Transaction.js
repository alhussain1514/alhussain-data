import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    type: {
      type: String,
      enum: ['data', 'airtime', 'electricity', 'tv', 'result_checker', 'wallet_fund', 'withdrawal', 'referral'],
      required: true,
    },

    description: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true,
    },

    reference: { type: String, required: true, unique: true },

    // Balances at time of transaction, for audit trail
    balanceBefore: { type: Number },
    balanceAfter: { type: Number },

    // Service-specific metadata (network, phone, meter number, plan, etc.)
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },

    // Raw response from external provider (VTU API / Paystack), for debugging
    providerResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
)

transactionSchema.index({ user: 1, createdAt: -1 })

export default mongoose.model('Transaction', transactionSchema)
