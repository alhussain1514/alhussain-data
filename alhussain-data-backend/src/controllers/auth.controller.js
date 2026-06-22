import crypto from 'crypto'
import User from '../models/User.js'
import { generateToken } from '../utils/generateToken.js'
import { creditWallet } from '../utils/walletEngine.js'

// POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { name, phone, email, password, referralCode } = req.body

    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required.' })
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' })
    }

    const existingPhone = await User.findOne({ phone })
    if (existingPhone) return res.status(409).json({ message: 'An account with this phone number already exists.' })

    if (email) {
      const existingEmail = await User.findOne({ email: email.toLowerCase() })
      if (existingEmail) return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    let referrer = null
    if (referralCode) {
      referrer = await User.findOne({ referralCode: referralCode.toUpperCase() })
      if (!referrer) {
        return res.status(400).json({ message: 'Invalid referral code.' })
      }
    }

    const user = await User.create({
      name,
      phone,
      email: email?.toLowerCase(),
      password,
      referredBy: referrer?._id || null,
    })

    if (referrer) {
      referrer.referralCount += 1
      await referrer.save()
      // Bonus is credited later, once this user funds their wallet — see wallet.controller.js
    }

    const token = generateToken(user._id)
    res.status(201).json({ token, user: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body
    if (!phone || !password) {
      return res.status(400).json({ message: 'Phone and password are required.' })
    }

    const user = await User.findOne({ phone }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid phone number or password.' })
    }
    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'Your account has been suspended. Contact support.' })
    }

    user.lastLoginAt = new Date()
    await user.save()

    const token = generateToken(user._id)
    res.json({ token, user: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

// GET /api/auth/profile
export const getProfile = async (req, res, next) => {
  try {
    res.json({ user: req.user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

// PUT /api/auth/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body
    const user = req.user

    if (email && email.toLowerCase() !== user.email) {
      const exists = await User.findOne({ email: email.toLowerCase() })
      if (exists) return res.status(409).json({ message: 'Email already in use.' })
      user.email = email.toLowerCase()
    }
    if (phone && phone !== user.phone) {
      const exists = await User.findOne({ phone })
      if (exists) return res.status(409).json({ message: 'Phone number already in use.' })
      user.phone = phone
    }
    if (name) user.name = name

    await user.save()
    res.json({ user: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email: email?.toLowerCase() })

    // Always respond success to avoid leaking which emails are registered
    if (!user) return res.json({ message: 'If that email exists, a reset link has been sent.' })

    const resetToken = crypto.randomBytes(32).toString('hex')
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000 // 1 hour
    await user.save()

    // TODO: integrate an email provider (e.g. Resend, SendGrid) to actually send this link
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
    console.log(`📧 Password reset link for ${user.email}: ${resetUrl}`)

    res.json({ message: 'If that email exists, a reset link has been sent.' })
  } catch (err) {
    next(err)
  }
}

// POST /api/auth/reset-password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body
    if (!token || !password || password.length < 6) {
      return res.status(400).json({ message: 'Valid token and a password of at least 6 characters are required.' })
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires')

    if (!user) return res.status(400).json({ message: 'Reset link is invalid or has expired.' })

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: 'Password reset successful. You can now log in.' })
  } catch (err) {
    next(err)
  }
}
