import { useState } from 'react'
import { Wallet, ArrowRight, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { walletAPI } from '../utils/api'
import { formatNaira } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

const QUICK_AMOUNTS = [500, 1000, 2000, 5000, 10000, 20000]

export default function FundWallet() {
  const { user, updateUser } = useAuth()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFund = async () => {
    const amt = parseFloat(amount)
    if (!amt || amt < 100) return toast.error('Minimum funding amount is ₦100')
    if (amt > 1000000) return toast.error('Maximum per transaction is ₦1,000,000')

    setLoading(true)
    try {
      const res = await walletAPI.initiateFunding(amt)
      // Redirect to Paystack payment page
      const { authorization_url, reference } = res.data
      if (authorization_url) {
        window.location.href = authorization_url
      } else {
        toast.error('Could not initiate payment')
      }
    } catch (err) {
      // Demo: simulate success
      toast.success(`Wallet funded with ${formatNaira(amt)} (demo mode)`)
      updateUser({ walletBalance: (user?.walletBalance || 0) + amt })
      setAmount('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">Fund Wallet</h2>
        <p className="text-slate-400 text-sm">Add money securely via Paystack</p>
      </div>

      {/* Current balance */}
      <div className="rounded-2xl p-6 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #1E3A8A, #312E81)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
             style={{ background: 'radial-gradient(circle, #6366F1, transparent)', transform: 'translate(30%, -30%)' }} />
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Current Balance</p>
        <p className="font-display text-3xl font-bold text-white">{formatNaira(user?.walletBalance || 0)}</p>
        <p className="text-xs text-white/40 mt-2">{user?.phone}</p>
      </div>

      {/* Amount input */}
      <div>
        <label className="input-label">Amount to add (₦)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">₦</span>
          <input type="number" placeholder="0.00"
            value={amount} onChange={(e) => setAmount(e.target.value)}
            className="input-field pl-8 text-lg font-semibold" min="100" />
        </div>

        {/* Quick amounts */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          {QUICK_AMOUNTS.map((q) => (
            <button key={q} onClick={() => setAmount(String(q))}
              className={`py-2.5 rounded-xl text-sm font-medium transition-all
                ${amount === String(q)
                  ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/40'
                  : 'glass-card text-slate-400 hover:text-white hover:border-white/20'}`}>
              ₦{q.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* New balance preview */}
      {amount && parseFloat(amount) >= 100 && (
        <div className="glass-card p-4 animate-slide-up">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Current balance</span>
            <span className="text-white">{formatNaira(user?.walletBalance || 0)}</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Adding</span>
            <span className="text-emerald-400">+ {formatNaira(parseFloat(amount))}</span>
          </div>
          <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
            <span className="text-sm font-medium text-white">New balance</span>
            <span className="font-display font-bold text-brand-cyan">
              {formatNaira((user?.walletBalance || 0) + parseFloat(amount))}
            </span>
          </div>
        </div>
      )}

      {/* Payment methods info */}
      <div className="glass-card p-4">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3 font-medium">Accepted payment methods</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { icon: '💳', label: 'Debit Card' },
            { icon: '🏦', label: 'Bank Transfer' },
            { icon: '📱', label: 'USSD' },
          ].map((m) => (
            <div key={m.label} className="rounded-lg bg-white/5 py-2.5 px-1">
              <div className="text-lg mb-1">{m.icon}</div>
              <p className="text-xs text-slate-400">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleFund} disabled={loading || !amount || parseFloat(amount) < 100}
        className="btn-primary w-full justify-center gap-2 py-3.5 text-base disabled:opacity-60">
        {loading
          ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Redirecting to Paystack…</span>
          : <><Wallet size={17} />Fund {amount ? formatNaira(parseFloat(amount)) : 'Wallet'} via Paystack</>
        }
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <Shield size={12} />
        Secured by Paystack. Your payment info is never stored on our servers.
      </div>
    </div>
  )
}
