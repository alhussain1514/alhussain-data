import User from '../models/User.js'
import Transaction from '../models/Transaction.js'

// GET /api/referral/info
export const getReferralInfo = async (req, res, next) => {
  try {
    res.json({
      code: req.user.referralCode,
      count: req.user.referralCount,
      earnings: req.user.referralEarnings,
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/referral/list
export const getReferralList = async (req, res, next) => {
  try {
    const referredUsers = await User.find({ referredBy: req.user._id })
      .select('name createdAt')
      .sort({ createdAt: -1 })

    // Pull the referral bonus transaction tied to each referred user, if any
    const referrals = await Promise.all(
      referredUsers.map(async (u) => {
        const bonusTx = await Transaction.findOne({
          user: req.user._id,
          type: 'referral',
          'meta.referredUser': u._id,
        })
        return {
          _id: u._id,
          name: u.name,
          joinedAt: u.createdAt,
          bonus: bonusTx?.amount || 0,
          status: bonusTx ? 'active' : 'pending',
        }
      })
    )

    res.json({ referrals })
  } catch (err) {
    next(err)
  }
}
