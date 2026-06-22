import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, User, Phone, Lock, Gift } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../utils/api'

export default function Register() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: searchParams.get('ref') || '',
  })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: personal info, 2: security
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const validateStep1 = () => {
    if (!form.name.trim()) return toast.error('Enter your full name') || false
    if (!form.phone.match(/^0[7-9][0-1]\d{8}$/)) return toast.error('Enter a valid Nigerian phone number') || false
    if (form.email && !form.email.includes('@')) return toast.error('Enter a valid email') || false
    return true
  }

  const handleNext = () => {
    if (validateStep1()) setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match')

    setLoading(true)
    try {
      const res = await authAPI.register({
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        referralCode: form.referralCode || undefined,
      })
      const { token, user } = res.data
      login(user, token)
      toast.success('Account created! Welcome 🎉')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #0F1E45 0%, #0A0F1E 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)' }} />
        </div>

        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight relative z-10">
          <div className="w-9 h-9 rounded-xl bg-brand-blue/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-brand-cyan" />
          </div>
          AL-HUSSAIN <span className="text-brand-cyan">DATA</span>
        </Link>

        <div className="relative z-10 space-y-4">
          {[
            { icon: '📶', title: 'Cheapest data rates', desc: 'Lower than your local vendor, always.' },
            { icon: '⚡', title: 'Instant delivery', desc: 'Data and tokens in under 5 seconds.' },
            { icon: '🎁', title: 'Earn from referrals', desc: 'Get wallet bonuses for every friend you invite.' },
            { icon: '🔐', title: 'Bank-grade security', desc: 'Powered by Paystack. Your funds are safe.' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl glass-card flex items-center justify-center text-base flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-slate-600 text-xs relative z-10">© 2025 AL-HUSSAIN DATA</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-brand-cyan" />
            </div>
            AL-HUSSAIN <span className="text-brand-cyan">DATA</span>
          </Link>

          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Create your account</h1>
            <p className="text-slate-400 text-sm">Free forever. No credit card required.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${step >= s ? 'bg-brand-blue text-white' : 'bg-white/5 text-slate-500 border border-white/10'}`}>
                  {step > s ? '✓' : s}
                </div>
                <span className={`text-xs font-medium ${step >= s ? 'text-white' : 'text-slate-500'}`}>
                  {s === 1 ? 'Personal info' : 'Security'}
                </span>
                {s < 2 && <div className={`h-px w-8 ${step > s ? 'bg-brand-blue' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="input-label">Full name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Hussain Modu"
                    value={form.name} onChange={set('name')}
                    className="input-field pl-10" required />
                </div>
              </div>

              <div>
                <label className="input-label">Phone number <span className="text-brand-cyan">*</span></label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="tel" placeholder="08012345678"
                    value={form.phone} onChange={set('phone')}
                    className="input-field pl-10" required />
                </div>
              </div>

              <div>
                <label className="input-label">Email address <span className="text-slate-500">(optional)</span></label>
                <input type="email" placeholder="you@email.com"
                  value={form.email} onChange={set('email')}
                  className="input-field" />
              </div>

              {form.referralCode && (
                <div>
                  <label className="input-label">Referral code</label>
                  <div className="relative">
                    <Gift size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-cyan" />
                    <input type="text" value={form.referralCode}
                      onChange={set('referralCode')}
                      className="input-field pl-10 text-brand-cyan" />
                  </div>
                </div>
              )}

              <button type="button" onClick={handleNext}
                className="btn-primary w-full justify-center gap-2 py-3.5 text-base mt-2">
                Continue <ArrowRight size={17} />
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPw ? 'text' : 'password'}
                    placeholder="Minimum 6 characters"
                    value={form.password} onChange={set('password')}
                    className="input-field pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="input-label">Confirm password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type={showPw ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={form.confirmPassword} onChange={set('confirmPassword')}
                    className="input-field pl-10" required />
                </div>
                {/* Password strength */}
                {form.password && (
                  <div className="flex gap-1 mt-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                        form.password.length >= i * 3
                          ? i <= 2 ? 'bg-red-400' : i === 3 ? 'bg-yellow-400' : 'bg-emerald-400'
                          : 'bg-white/10'
                      }`} />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500">
                By creating an account, you agree to our{' '}
                <a href="#" className="text-brand-blue hover:underline">Terms</a> and{' '}
                <a href="#" className="text-brand-blue hover:underline">Privacy Policy</a>.
              </p>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)}
                  className="btn-ghost flex-1 justify-center py-3.5">
                  Back
                </button>
                <button type="submit" disabled={loading}
                  className="btn-primary flex-1 justify-center gap-2 py-3.5 text-base disabled:opacity-60">
                  {loading
                    ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating…</span>
                    : 'Create account'
                  }
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-blue hover:text-brand-cyan font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
