import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import Pricing from '../models/Pricing.js'
import { creditWallet } from '../utils/walletEngine.js'

// GET /api/admin/users?page=1
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ])

    res.json({
      users: users.map((u) => u.toPublicJSON()),
      total,
      page,
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ message: 'User not found.' })

    const transactions = await Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(20)
    res.json({ user: user.toPublicJSON(), transactions })
  } catch (err) {
    next(err)
  }
}

// POST /api/admin/users/:id/fund
export const fundUser = async (req, res, next) => {
  try {
    const { amount } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Enter a valid amount.' })

    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ message: 'User not found.' })

    const { user } = await creditWallet({
      userId: targetUser._id,
      amount,
      type: 'wallet_fund',
      description: `Manual credit by admin (${req.user.name})`,
      meta: { creditedBy: req.user._id },
    })

    res.json({ message: `${targetUser.name}'s wallet credited successfully.`, balance: user.walletBalance })
  } catch (err) {
    next(err)
  }
}

// PUT /api/admin/users/:id/status
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or suspended.' })
    }

    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found.' })

    res.json({ message: `User ${status === 'active' ? 'activated' : 'suspended'}.`, user: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/transactions?page=1
export const getAllTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 25
    const skip = (page - 1) * limit
    const { status, type } = req.query

    const filter = {}
    if (status) filter.status = status
    if (type) filter.type = type

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('user', 'name phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ])

    res.json({ transactions, total, page, pages: Math.ceil(total / limit) })
  } catch (err) {
    next(err)
  }
}

// GET /api/admin/stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      newUsersToday,
      totalTransactions,
      revenueAgg,
      revenueTodayAgg,
      walletSumAgg,
      recentTransactions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { status: 'success', type: { $in: ['data', 'airtime', 'electricity', 'tv'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            status: 'success',
            type: { $in: ['data', 'airtime', 'electricity', 'tv'] },
            createdAt: { $gte: startOfToday },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$walletBalance' } } }]),
      Transaction.find().populate('user', 'name').sort({ createdAt: -1 }).limit(8),
    ])

    res.json({
      stats: {
        totalUsers,
        newUsersToday,
        totalTransactions,
        totalRevenue: revenueAgg[0]?.total || 0,
        revenueToday: revenueTodayAgg[0]?.total || 0,
        walletBalanceSum: walletSumAgg[0]?.total || 0,
      },
      recentTransactions,
    })
  } catch (err) {
    next(err)
  }
}

// PUT /api/admin/pricing
export const updatePricing = async (req, res, next) => {
  try {
    const { dataPlans, tvPlans, airtimeDiscount, electricityFee } = req.body

    let pricing = await Pricing.findOne()
    if (!pricing) pricing = new Pricing()

    if (dataPlans) pricing.dataPlans = dataPlans.map((p) => ({
      id: p.id,
      name: p.name,
      duration: p.duration,
      network: p.network,
      providerPrice: p.providerPrice || p.costPrice || 0,
      sellingPrice: p.sellingPrice || p.price || 0,
      providerPlanId: p.providerPlanId || '',
      active: p.active !== false,
    }))
    if (tvPlans) pricing.tvPlans = tvPlans
    if (airtimeDiscount) pricing.airtimeDiscount = airtimeDiscount
    if (electricityFee !== undefined) pricing.electricityFee = electricityFee

    await pricing.save()
    res.json({ message: 'Pricing updated successfully.', pricing })
  } catch (err) {
    next(err)
  }
}
