import Pricing from '../models/Pricing.js'
import { debitWallet, resolveTransaction } from '../utils/walletEngine.js'
import { vtuProvider } from '../utils/vtuProvider.js'

// ───────────────────────── DATA ─────────────────────────

// GET /api/vtu/data/plans/:network
export const getDataPlans = async (req, res, next) => {
  try {
    const { network } = req.params
    const pricing = await Pricing.findOne()
    const plans = (pricing?.dataPlans || [])
      .filter((p) => p.network === network.toUpperCase() && p.active)
      .map((p) => ({ id: p.id, name: p.name, duration: p.duration, price: p.sellingPrice }))

    res.json({ plans })
  } catch (err) {
    next(err)
  }
}

// POST /api/vtu/data/buy
export const buyData = async (req, res, next) => {
  try {
    const { network, planId, phone } = req.body
    if (!network || !planId || !phone) {
      return res.status(400).json({ message: 'Network, plan, and phone number are required.' })
    }

    const pricing = await Pricing.findOne()
    const plan = pricing?.dataPlans.find((p) => p.id === planId && p.network === network.toUpperCase())
    if (!plan) return res.status(404).json({ message: 'Selected data plan was not found.' })

    const { transaction } = await debitWallet({
      userId: req.user._id,
      amount: plan.sellingPrice,
      type: 'data',
      description: `${network.toUpperCase()} ${plan.name} — ${phone}`,
      meta: { network, planId, phone, planName: plan.name },
    })

    try {
      const providerRes = await vtuProvider.buyData({
        network,
        planId,
        phone,
        providerPlanId: plan.providerPlanId,
      })
      await resolveTransaction({ transactionId: transaction._id, status: 'success', providerResponse: providerRes })
      res.json({ message: 'Data purchased successfully!', reference: transaction.reference })
    } catch (providerErr) {
      await resolveTransaction({
        transactionId: transaction._id,
        status: 'failed',
        providerResponse: providerErr.response?.data || { error: providerErr.message },
      })
      return res.status(502).json({ message: 'Data delivery failed. You have been refunded.' })
    }
  } catch (err) {
    next(err)
  }
}

// ───────────────────────── AIRTIME ─────────────────────────

// POST /api/vtu/airtime/buy
export const buyAirtime = async (req, res, next) => {
  try {
    const { network, phone, amount } = req.body
    if (!network || !phone || !amount) {
      return res.status(400).json({ message: 'Network, phone, and amount are required.' })
    }
    if (amount < 50) return res.status(400).json({ message: 'Minimum airtime purchase is ₦50.' })
    if (amount > 50000) return res.status(400).json({ message: 'Maximum airtime purchase is ₦50,000.' })

    const { transaction } = await debitWallet({
      userId: req.user._id,
      amount,
      type: 'airtime',
      description: `${network.toUpperCase()} Airtime — ${phone}`,
      meta: { network, phone },
    })

    try {
      const providerRes = await vtuProvider.buyAirtime({ network, phone, amount })
      await resolveTransaction({ transactionId: transaction._id, status: 'success', providerResponse: providerRes })
      res.json({ message: 'Airtime sent successfully!', reference: transaction.reference })
    } catch (providerErr) {
      await resolveTransaction({
        transactionId: transaction._id,
        status: 'failed',
        providerResponse: providerErr.response?.data || { error: providerErr.message },
      })
      return res.status(502).json({ message: 'Airtime delivery failed. You have been refunded.' })
    }
  } catch (err) {
    next(err)
  }
}

// ───────────────────────── ELECTRICITY ─────────────────────────

// POST /api/vtu/electricity/verify
export const verifyMeter = async (req, res, next) => {
  try {
    const { disco, meterType, meterNumber } = req.body
    if (!disco || !meterType || !meterNumber) {
      return res.status(400).json({ message: 'DISCO, meter type, and meter number are required.' })
    }

    const result = await vtuProvider.verifyMeter({ disco, meterType, meterNumber })
    res.json({ name: result.name || result.customer_name, address: result.address, meterNumber })
  } catch (err) {
    res.status(502).json({ message: 'Could not verify meter. Check the number and try again.' })
  }
}

// POST /api/vtu/electricity/pay
export const payElectricity = async (req, res, next) => {
  try {
    const { disco, meterType, meterNumber, amount, customerName } = req.body
    if (!disco || !meterType || !meterNumber || !amount) {
      return res.status(400).json({ message: 'All fields are required.' })
    }
    if (amount < 500) return res.status(400).json({ message: 'Minimum payment is ₦500.' })

    const { transaction } = await debitWallet({
      userId: req.user._id,
      amount,
      type: 'electricity',
      description: `${disco.toUpperCase()} ${meterType} — Meter ${meterNumber}`,
      meta: { disco, meterType, meterNumber },
    })

    try {
      const providerRes = await vtuProvider.payElectricity({ disco, meterType, meterNumber, amount, customerName })
      await resolveTransaction({ transactionId: transaction._id, status: 'success', providerResponse: providerRes })
      res.json({
        message: 'Payment successful!',
        token: providerRes.token || providerRes.purchased_code,
        reference: transaction.reference,
      })
    } catch (providerErr) {
      await resolveTransaction({
        transactionId: transaction._id,
        status: 'failed',
        providerResponse: providerErr.response?.data || { error: providerErr.message },
      })
      return res.status(502).json({ message: 'Payment failed. You have been refunded.' })
    }
  } catch (err) {
    next(err)
  }
}

// ───────────────────────── TV ─────────────────────────

// POST /api/vtu/tv/verify
export const verifyDecoder = async (req, res, next) => {
  try {
    const { provider, smartcard } = req.body
    if (!provider || !smartcard) {
      return res.status(400).json({ message: 'Provider and smartcard number are required.' })
    }

    const result = await vtuProvider.verifyDecoder({ provider, smartcard })
    res.json({ name: result.customer_name || result.name, package: result.current_bouquet })
  } catch (err) {
    res.status(502).json({ message: 'Could not verify smartcard. Check the number and try again.' })
  }
}

// POST /api/vtu/tv/pay
export const payTV = async (req, res, next) => {
  try {
    const { provider, smartcard, planId, amount } = req.body
    if (!provider || !smartcard || !planId || !amount) {
      return res.status(400).json({ message: 'All fields are required.' })
    }

    const pricing = await Pricing.findOne()
    const plan = pricing?.tvPlans.find((p) => p.id === planId && p.provider === provider)
    if (!plan) return res.status(404).json({ message: 'Selected plan was not found.' })

    const { transaction } = await debitWallet({
      userId: req.user._id,
      amount: plan.sellingPrice,
      type: 'tv',
      description: `${provider.toUpperCase()} ${plan.name} — ${smartcard}`,
      meta: { provider, smartcard, planId, planName: plan.name },
    })

    try {
      const providerRes = await vtuProvider.payTV({
        provider,
        smartcard,
        providerPlanId: plan.providerPlanId,
        amount: plan.sellingPrice,
      })
      await resolveTransaction({ transactionId: transaction._id, status: 'success', providerResponse: providerRes })
      res.json({ message: 'Subscription renewed!', reference: transaction.reference })
    } catch (providerErr) {
      await resolveTransaction({
        transactionId: transaction._id,
        status: 'failed',
        providerResponse: providerErr.response?.data || { error: providerErr.message },
      })
      return res.status(502).json({ message: 'Renewal failed. You have been refunded.' })
    }
  } catch (err) {
    next(err)
  }
}
