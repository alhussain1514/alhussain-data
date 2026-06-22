import mongoose from 'mongoose'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import { generateReference } from './generateReference.js'

/**
 * Debits a user's wallet and logs a transaction — atomically.
 * Throws if balance is insufficient or user not found.
 *
 * @param {Object} params
 * @param {String} params.userId
 * @param {Number} params.amount
 * @param {String} params.type        - 'data' | 'airtime' | 'electricity' | 'tv' | 'withdrawal'
 * @param {String} params.description
 * @param {Object} [params.meta]      - service-specific details (network, phone, meterNumber, etc.)
 * @param {String} [params.status]    - defaults to 'pending'; caller updates to 'success'/'failed' after provider call
 * @returns {Promise<{ user: Document, transaction: Document }>}
 */
export const debitWallet = async ({ userId, amount, type, description, meta = {}, status = 'pending' }) => {
  if (amount <= 0) throw Object.assign(new Error('Amount must be greater than zero.'), { statusCode: 400 })

  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const user = await User.findById(userId).session(session)
    if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 })
    if (user.walletBalance < amount) {
      throw Object.assign(new Error('Insufficient wallet balance.'), { statusCode: 400 })
    }

    const balanceBefore = user.walletBalance
    user.walletBalance -= amount
    await user.save({ session })

    const [transaction] = await Transaction.create(
      [{
        user: userId,
        type,
        description,
        amount,
        status,
        reference: generateReference(),
        balanceBefore,
        balanceAfter: user.walletBalance,
        meta,
      }],
      { session }
    )

    await session.commitTransaction()
    session.endSession()
    return { user, transaction }
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    throw err
  }
}

/**
 * Credits a user's wallet and logs a transaction — atomically.
 * Used for wallet funding, referral bonuses, refunds on failed VTU purchases.
 */
export const creditWallet = async ({ userId, amount, type, description, meta = {}, status = 'success', reference }) => {
  if (amount <= 0) throw Object.assign(new Error('Amount must be greater than zero.'), { statusCode: 400 })

  const session = await mongoose.startSession()
  session.startTransaction()
  try {
    const user = await User.findById(userId).session(session)
    if (!user) throw Object.assign(new Error('User not found.'), { statusCode: 404 })

    const balanceBefore = user.walletBalance
    user.walletBalance += amount
    await user.save({ session })

    const [transaction] = await Transaction.create(
      [{
        user: userId,
        type,
        description,
        amount,
        status,
        reference: reference || generateReference(),
        balanceBefore,
        balanceAfter: user.walletBalance,
        meta,
      }],
      { session }
    )

    await session.commitTransaction()
    session.endSession()
    return { user, transaction }
  } catch (err) {
    await session.abortTransaction()
    session.endSession()
    throw err
  }
}

/**
 * Marks an existing pending transaction as success/failed.
 * If a debit transaction fails (e.g. VTU provider error), automatically
 * refunds the user so they're never charged for a failed delivery.
 */
export const resolveTransaction = async ({ transactionId, status, providerResponse = {} }) => {
  const transaction = await Transaction.findById(transactionId)
  if (!transaction) throw Object.assign(new Error('Transaction not found.'), { statusCode: 404 })

  transaction.status = status
  transaction.providerResponse = providerResponse
  await transaction.save()

  // Auto-refund on failure for debit-type transactions
  const debitTypes = ['data', 'airtime', 'electricity', 'tv', 'withdrawal']
  if (status === 'failed' && debitTypes.includes(transaction.type)) {
    await creditWallet({
      userId: transaction.user,
      amount: transaction.amount,
      type: transaction.type,
      description: `Refund: ${transaction.description}`,
      meta: { refundFor: transaction.reference },
      status: 'success',
    })
  }

  return transaction
}
