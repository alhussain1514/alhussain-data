import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import Pricing from '../models/Pricing.js'
import { creditWallet } from '../utils/walletEngine.js'
import { vtuProvider } from '../utils/vtuProvider.js'

// GET /api/admin/users?page=1
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = 20
    const skip = (page - 1) * limit
    const { search } = req.query

    const filter = search
      ? { $or: [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
      : {}

    const [users, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
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
    const { status, type, from, to, search } = req.query

    const filter = {}
    if (status) filter.status = status
    if (type) filter.type = type
    if (from || to) {
      filter.createdAt = {}
      if (from) filter.createdAt.$gte = new Date(from)
      if (to) filter.createdAt.$lte = new Date(to)
    }
    if (search) {
      filter.$or = [
        { reference: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ]
    }

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

// GET /api/admin/provider-balance
// Live wallet balance on Demboss's side, so the admin knows when to top up
// the reseller account before it runs dry mid-transaction.
export const getProviderBalance = async (req, res, next) => {
  try {
    const details = await vtuProvider.getUserDetails()
    res.json({ name: details.name, balance: details.balance })
  } catch (err) {
    res.status(502).json({ message: 'Could not reach Demboss to fetch balance. Check DEMBOSS_API_TOKEN and network access.' })
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
      statusBreakdownAgg,
      typeBreakdownAgg,
      recentTransactions,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      Transaction.countDocuments(),
      Transaction.aggregate([
        { $match: { status: 'success', type: { $in: ['data', 'airtime', 'electricity', 'tv', 'result_checker'] } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        {
          $match: {
            status: 'success',
            type: { $in: ['data', 'airtime', 'electricity', 'tv', 'result_checker'] },
            createdAt: { $gte: startOfToday },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$walletBalance' } } }]),
      Transaction.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Transaction.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      Transaction.find().populate('user', 'name').sort({ createdAt: -1 }).limit(8),
    ])

    const statusBreakdown = { pending: 0, success: 0, failed: 0 }
    statusBreakdownAgg.forEach((s) => { if (s._id in statusBreakdown) statusBreakdown[s._id] = s.count })

    const typeBreakdown = {}
    typeBreakdownAgg.forEach((t) => { typeBreakdown[t._id] = t.count })

    res.json({
      stats: {
        totalUsers,
        newUsersToday,
        totalTransactions,
        totalRevenue: revenueAgg[0]?.total || 0,
        revenueToday: revenueTodayAgg[0]?.total || 0,
        walletBalanceSum: walletSumAgg[0]?.total || 0,
        statusBreakdown,
        typeBreakdown,
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
    const { dataPlans, tvPlans, examPinPrices, airtimeDiscount, electricityFee } = req.body

    let pricing = await Pricing.findOne()
    if (!pricing) pricing = new Pricing()

    if (dataPlans) pricing.dataPlans = dataPlans
    if (tvPlans) pricing.tvPlans = tvPlans
    if (examPinPrices) pricing.examPinPrices = examPinPrices
    if (airtimeDiscount) pricing.airtimeDiscount = airtimeDiscount
    if (electricityFee !== undefined) pricing.electricityFee = electricityFee

    await pricing.save()
    res.json({ message: 'Pricing updated successfully.', pricing })
  } catch (err) {
    next(err)
  }
}
