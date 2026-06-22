import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { customAlphabet } from 'nanoid'

const genCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^0[7-9][0-1]\d{8}$/, 'Enter a valid Nigerian phone number'],
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true, // allows multiple nulls while keeping uniqueness for set values
      unique: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },

    walletBalance: { type: Number, default: 0, min: 0 },

    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },

    referralCode: { type: String, unique: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    referralEarnings: { type: Number, default: 0 },
    referralCount: { type: Number, default: 0 },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
)

// Generate unique referral code before saving a new user
userSchema.pre('save', async function (next) {
  if (this.isNew && !this.referralCode) {
    let code, exists = true
    while (exists) {
      code = `AHD-${genCode()}`
      exists = await mongoose.models.User.findOne({ referralCode: code })
    }
    this.referralCode = code
  }

  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }

  next()
})

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Shape returned to frontend — matches AuthContext expectations exactly
userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    name: this.name,
    phone: this.phone,
    email: this.email,
    walletBalance: this.walletBalance,
    role: this.role,
    status: this.status,
    referralCode: this.referralCode,
    referralEarnings: this.referralEarnings,
    referralCount: this.referralCount,
    createdAt: this.createdAt,
  }
}

export default mongoose.model('User', userSchema)
