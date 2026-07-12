import Pricing from '../models/Pricing.js'
import { debitWallet, resolveTransaction } from '../utils/walletEngine.js'
import { vtuProvider } from '../utils/vtuProvider.js'

export const getDataPlans = async (req, res, next) => {
  try {
    const { network } = req.params
    const pricing = await Pricing.findOne()
    const plans = (pricing?.dataPlans || [])
      .filter((p) => p.network === network.toUpperCase() && p.active)
      .map((p) => ({ id: p.id, name: p.name, duration: p.duration, price: p.sellingPrice, sellingPrice: p.sellingPrice, costPrice: p.costPrice, providerPlanId: p.providerPlanId, planType: p.planType }))
    res.json({ plans })
  } catch (err) {
    next(err)
  }
}

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
        phone,
        providerPlanId: plan.providerPlanId,
        ref: transaction.reference,
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
      const providerRes = await vtuProvider.buyAirtime({ network, phone, amount, ref: transaction.reference })
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

export const verifyMeter = async (req, res, next) => {
  try {
    const { disco, meterType, meterNumber } = req.body
    if (!disco || !meterType || !meterNumber) {
      return res.status(400).json({ message: 'DISCO, meter type, and meter number are required.' })
    }
    const result = await vtuProvider.verifyMeter({ disco, meterType, meterNumber })
    res.json({ supported: false, meterNumber, ...result })
  } catch (err) {
    res.status(502).json({ supported: false, message: 'Verification is not available for this provider.' })
  }
}

export const payElectricity = async (req, res, next) => {
  try {
    const { disco, meterType, meterNumber, amount, customerName, customerPhone, customerAddress } = req.body
    if (!disco || !meterType || !meterNumber || !amount) {
      return res.status(400).json({ message: 'DISCO, meter type, meter number, and amount are required.' })
    }
    if (amount < 500) return res.status(400).json({ message: 'Minimum payment is ₦500.' })

    const pricing = await Pricing.findOne()
    const fee = pricing?.electricityFee || 0
    const totalCharge = Number(amount) + fee

    const { transaction } = await debitWallet({
      userId: req.user._id,
      amount: totalCharge,
      type: 'electricity',
      description: `${disco.toUpperCase()} ${meterType} — Meter ${meterNumber}`,
      meta: { disco, meterType, meterNumber, customerName, customerPhone, customerAddress, billAmount: amount, fee },
    })

    try {
      const providerRes = await vtuProvider.payElectricity({ disco, meterType, meterNumber, amount, ref: transaction.reference })
      await resolveTransaction({ transactionId: transaction._id, status: 'success', providerResponse: providerRes })
      res.json({
        message: 'Payment successful!',
        token: providerRes.token,
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

export const getTvPlans = async (req, res, next) => {
  try {
    const { provider } = req.params
    const pricing = await Pricing.findOne()
    const plans = (pricing?.tvPlans || [])
      .filter((p) => p.provider === provider.toLowerCase() && p.active)
      .map((p) => ({ id: p.id, name: p.name, price: p.sellingPrice, sellingPrice: p.sellingPrice, costPrice: p.costPrice, providerPlanId: p.providerPlanId }))
    res.json({ plans })
  } catch (err) {
    next(err)
  }
}

export const verifyDecoder = async (req, res, next) => {
  try {
    const { provider, smartcard } = req.body
    if (!provider || !smartcard) {
      return res.status(400).json({ message: 'Provider and smartcard number are required.' })
    }
    const result = await vtuProvider.verifyDecoder({ provider, smartcard })
    res.json({ supported: false, ...result })
  } catch (err) {
    res.status(502).json({ supported: false, message: 'Verification is not available for this provider.' })
  }
}

export const payTV = async (req, res, next) => {
  try {
    const { provider, smartcard, planId } = req.body
    if (!provider || !smartcard || !planId) {
      return res.status(400).json({ message: 'Provider, smartcard number, and plan are required.' })
    }
    const pricing = await Pricing.findOne()
    const plan = pricing?.tvPlans.find((p) => p.id === planId && p.provider === provider.toLowerCase())
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
        ref: transaction.reference,
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

export const getExamPinPrices = async (req, res, next) => {
  try {
    const pricing = await Pricing.findOne()
    res.json({ prices: pricing?.examPinPrices || [] })
  } catch (err) {
    next(err)
  }
}

export const buyResultChecker = async (req, res, next) => {
  try {
    const { examName, quantity } = req.body
    const validExams = ['WAEC', 'NECO', 'JAMB', 'NABTEB', 'WAECREGISTRATION', 'NBAIS']

    if (!examName || !validExams.includes(examName.toUpperCase())) {
      return res.status(400).json({ message: 'Exam name must be WAEC, NECO, JAMB, NABTEB, WAECREGISTRATION, or NBAIS.' })
    }
    const qty = Number(quantity)
    if (!qty || qty < 1 || qty > 5) {
      return res.status(400).json({ message: 'Quantity must be between 1 and 5.' })
    }

    const exam = examName.toUpperCase()
    const pricing = await Pricing.findOne()
    const priceEntry = pricing?.examPinPrices?.find((p) => p.examName === exam)
    if (!priceEntry) return res.status(404).json({ message: 'Pricing for this exam is not configured yet.' })

    const amount = priceEntry.sellingPrice * qty

    const { transaction } = await debitWallet({
      userId: req.user._id,
      amount,
      type: 'result_checker',
      description: `${exam} Result Checker x${qty}`,
      meta: { examName: exam, quantity: qty },
    })

    try {
      const providerRes = await vtuProvider.buyResultChecker({ examName: exam, quantity: qty, ref: transaction.reference })
      await resolveTransaction({ transactionId: transaction._id, status: 'success', providerResponse: providerRes })
      res.json({
        message: 'Result checker pin(s) purchased successfully!',
        reference: transaction.reference,
        pins: providerRes.pins || [],
      })
    } catch (providerErr) {
      await resolveTransaction({
        transactionId: transaction._id,
        status: 'failed',
        providerResponse: providerErr.response?.data || { error: providerErr.message },
      })
      return res.status(502).json({ message: 'Pin purchase failed. You have been refunded.' })
    }
  } catch (err) {
    next(err)
  }
}
