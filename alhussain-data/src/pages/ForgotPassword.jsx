import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../utils/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.includes('@')) return toast.error('Enter a valid email address')
    setLoading(true)
    try {
      await authAPI.forgotPassword(email)
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <div className="glass-card p-8">
          {!sent ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center mb-6">
                <Mail size={24} className="text-brand-blue" />
              </div>
              <h1 className="font-display text-2xl font-bold mb-2">Reset your password</h1>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Enter the email address linked to your account and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="input-label">Email address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="email" placeholder="you@email.com"
                      value={email} onChange={(e) => setEmail(e.target.value)}
                      className="input-field pl-10" required />
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="btn-primary w-full justify-center gap-2 py-3.5 disabled:opacity-60">
                  {loading
                    ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</span>
                    : <><span>Send reset link</span><ArrowRight size={17} /></>
                  }
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-400/10 flex items-center justify-center mb-6 mx-auto">
                <span className="text-2xl">📬</span>
              </div>
              <h2 className="font-display text-xl font-bold mb-2">Check your inbox</h2>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                We've sent a password reset link to <span className="text-white">{email}</span>.
                It expires in 1 hour.
              </p>
              <Link to="/login" className="btn-primary w-full justify-center py-3">
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
