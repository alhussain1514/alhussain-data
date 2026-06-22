import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight, Lock, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../utils/api'

export default function Login() {
  const [form, setForm] = useState({ phone: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.phone || !form.password) return toast.error('Please fill all fields')
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      const { token, user } = res.data
      login(user, token)
      toast.success(`Welcome back, ${user.name}!`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Check your credentials.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #0F1E45 0%, #0A0F1E 100%)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }} />
        </div>

        <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl tracking-tight relative z-10">
          <div className="w-9 h-9 rounded-xl bg-brand-blue/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-brand-cyan" />
          </div>
          AL-HUSSAIN <span className="text-brand-cyan">DATA</span>
        </Link>

        <div className="relative z-10">
          <div className="glass-card p-6 mb-6 max-w-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-brand flex items-center justify-center font-bold text-sm text-white">A</div>
              <div>
                <p className="text-sm font-medium text-white">Amina B.</p>
                <p className="text-xs text-slate-500">Abuja, Nigeria</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              "I pay my electricity and buy data every week. AL-HUSSAIN DATA is the fastest, no stress at all!"
            </p>
            <div className="flex gap-1 mt-3">
              {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400 text-sm">★</span>)}
            </div>
          </div>

          <h2 className="font-display text-3xl font-bold tracking-tight mb-3">
            Manage everything<br />
            from one wallet.
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            Data, airtime, electricity, TV — funded and delivered in seconds.
          </p>
        </div>

        <p className="text-slate-600 text-xs relative z-10">© 2025 AL-HUSSAIN DATA</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-lg tracking-tight mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-brand-blue/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-brand-cyan" />
            </div>
            AL-HUSSAIN <span className="text-brand-cyan">DATA</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-display text-2xl font-bold tracking-tight mb-1">Welcome back</h1>
            <p className="text-slate-400 text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="input-label">Phone number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="tel"
                  placeholder="08012345678"
                  value={form.phone}
                  onChange={set('phone')}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={set('password')}
                  className="input-field pl-10 pr-10"
                  required
                />
                <button type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end mt-1.5">
                <Link to="/forgot-password" className="text-xs text-brand-blue hover:text-brand-cyan transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center gap-2 py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in…</span>
                : <><span>Sign in</span><ArrowRight size={17} /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-blue hover:text-brand-cyan font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
