import Transaction from '../models/Transaction.js'
import User from '../models/User.js'
import { paystack } from '../utils/paystack.js'
import { creditWallet, debitWallet, resolveTransaction } from '../utils/walletEngine.js'
import { generateReference } from '../utils/generateReference.js'

const REFERRAL_BONUS = Number(process.env.REFERRAL_BONUS_AMOUNT || 200)
const REFERRAL_MIN_FUNDING = Number(process.env.REFERRAL_MIN_FUNDING || 500)

// GET /api/wallet/balance
export const getBalance = async (req, res, next) => {
  try {
    res.json({ balance: req.user.walletBalance })
  } catch (err) {
    next(err)
  }
}

// POST /api/wallet/fund/initiate
export const initiateFunding = async (req, res, next) => {
  try {
    const { amount } = req.body
    if (!amount || amount < 100) {
      return res.status(400).json({ message: 'Minimum funding amount is ₦100.' })
    }
    if (amount > 1_000_000) {
      return res.status(400).json({ message: 'Maximum funding amount per transaction is ₦1,000,000.' })
    }

    const reference = generateReference('FUND')

    // Log a pending transaction up front so we have a record even if the user abandons checkout
    await Transaction.create({
      user: req.user._id,
      type: 'wallet_fund',
      description: 'Wallet Funding via Paystack',
      amount,
      status: 'pending',
      reference,
      balanceBefore: req.user.walletBalance,
      balanceAfter: req.user.walletBalance, // unchanged until verified
    })

    const email = req.user.email || `${req.user.phone}@alhussaindata.ng` // Paystack requires an email
    const { authorization_url } = await paystack.initializeTransaction({
      email,
      amount,
      reference,
      callbackUrl: `${process.env.CLIENT_URL}/dashboard/fund-wallet?reference=${reference}`,
    })

    res.json({ authorization_url, reference })
  } catch (err) {
    next(err)
  }
}

// GET /api/wallet/fund/verify/:reference
// Called by the frontend after Paystack redirects back — confirms and credits if not already done.
export const verifyFunding = async (req, res, next) => {
  try {
    const { reference } = req.params
    const transaction = await Transaction.findOne({ reference, user: req.user._id })
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' })

    if (transaction.status === 'success') {
      return res.json({ message: 'Already verified.', balance: req.user.walletBalance })
    }

    const paystackData = await paystack.verifyTransaction(reference)
    if (paystackData.status !== 'success') {
      await resolveTransaction({ transactionId: transaction._id, status: 'failed', providerResponse: paystackData })
      return res.status(400).json({ message: 'Payment was not successful.' })
    }

    await creditAndMarkFunded(transaction, paystackData)
    const updatedUser = await User.findById(req.user._id)
    res.json({ message: 'Wallet funded successfully!', balance: updatedUser.walletBalance })
  } catch (err) {
    next(err)
  }
}

// POST /api/wallet/paystack/webhook
// Source of truth for crediting wallets — verified via signature, not dependent on user staying on page.
export const paystackWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature']
    const isValid = paystack.verifyWebhookSignature(req.rawBody, signature)
    if (!isValid) return res.status(401).send('Invalid signature')

    const event = req.body
    if (event.event === 'charge.success') {
      const { reference } = event.data
      const transaction = await Transaction.findOne({ reference })

      if (transaction && transaction.status !== 'success') {
        await creditAndMarkFunded(transaction, event.data)
      }
    }

    res.sendStatus(200)
  } catch (err) {
    console.error('Webhook error:', err.message)
    res.sendStatus(200) // Acknowledge anyway so Paystack doesn't keep retrying a bad payload
  }
}

// Shared helper: credits wallet + resolves the pending transaction + pays referral bonus if eligible
async function creditAndMarkFunded(transaction, providerResponse) {
  transaction.status = 'success'
  transaction.providerResponse = providerResponse
  const user = await User.findById(transaction.user)

  const balanceBefore = user.walletBalance
  user.walletBalance += transaction.amount
  transaction.balanceAfter = user.walletBalance
  await user.save()
  await transaction.save()

  // First-funding referral bonus
  if (user.referredBy && transaction.amount >= REFERRAL_MIN_FUNDING) {
    const priorFundings = await Transaction.countDocuments({
      user: user._id,
      type: 'wallet_fund',
      status: 'success',
    })
    if (priorFundings === 1) {
      // this funding (already marked success above) is their first — pay the referrer
      await creditWallet({
        userId: user.referredBy,
        amount: REFERRAL_BONUS,
        type: 'referral',
        description: `Referral Bonus — ${user.name} joined`,
        meta: { referredUser: user._id },
      })
      await User.findByIdAndUpdate(user.referredBy, { $inc: { referralEarnings: REFERRAL_BONUS } })
    }
  }
}

// GET /api/wallet/transactions?page=1
export const getTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const [transactions, total] = await Promise.all([
      Transaction.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Transaction.countDocuments({ user: req.user._id }),
    ])

    res.json({ transactions, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

// POST /api/wallet/withdraw
export const withdraw = async (req, res, next) => {
  try {
    const { amount, bankCode, accountNumber, accountName } = req.body
    if (!amount || amount < 100) return res.status(400).json({ message: 'Minimum withdrawal is ₦100.' })
    if (!bankCode || !accountNumber || !accountName) {
      return res.status(400).json({ message: 'Bank details are required.' })
    }

    const { transaction } = await debitWallet({
      userId: req.user._id,
      amount,
      type: 'withdrawal',
      description: `Withdrawal to ${accountName} — ${accountNumber}`,
      meta: { bankCode, accountNumber, accountName },
      status: 'pending',
    })

    // TODO: integrate Paystack Transfers API (or similar) to actually disburse funds,
    // then call resolveTransaction({ transactionId: transaction._id, status: 'success' | 'failed' })

    res.json({ message: 'Withdrawal request submitted. Funds will arrive within 24 hours.', transaction })
  } catch (err) {
    next(err)
  }
}
