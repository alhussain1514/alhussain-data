// ─── PayTV.jsx ────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Tv } from 'lucide-react'
import toast from 'react-hot-toast'
import { vtuAPI } from '../utils/api'
import { TV_PROVIDERS, formatNaira } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

export default function PayTV() {
  const { user, updateUser } = useAuth()
  const [provider, setProvider] = useState('dstv')
  const [smartcard, setSmartcard] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [plans, setPlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [plansError, setPlansError] = useState(null)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadPlans(provider)
    setPlan(null)
  }, [provider])

  const loadPlans = async (p) => {
    setLoadingPlans(true)
    setPlansError(null)
    try {
      const res = await vtuAPI.getTvPlans(p)
      setPlans(res.data.plans)
    } catch {
      setPlans([])
      setPlansError('Could not load plans. Check your connection and try again.')
    } finally {
      setLoadingPlans(false)
    }
  }

  // Demboss has no smartcard/IUC verification endpoint — we can't confirm the
  // subscriber's name before payment, so we ask the customer to double-check
  // the number themselves instead of faking a verified name.
  const handleConfirm = () => {
    if (!smartcard || smartcard.length < 8) return toast.error('Enter a valid smartcard/IUC number')
    setConfirmed(true)
  }

  const handlePay = async () => {
    if (!plan) return toast.error('Select a plan')
    if (!confirmed) return toast.error('Confirm your smartcard number first')
    if ((user?.walletBalance || 0) < plan.sellingPrice) return toast.error('Insufficient balance')
    setLoading(true)
    try {
      const res = await vtuAPI.payTV({ provider, smartcard, planId: plan.id })
      setSuccess({ provider, smartcard, plan, ...res.data })
      updateUser({ walletBalance: (user?.walletBalance || 0) - plan.sellingPrice })
      toast.success('Subscription renewed!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-brand-purple/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">📺</span>
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Subscription Renewed!</h2>
        <div className="glass-card p-5 text-left mb-6 space-y-3">
          {[
            ['Provider', TV_PROVIDERS.find(p => p.id === success.provider)?.label],
            ['Smartcard', success.smartcard],
            ['Plan', success.plan?.name],
            ['Amount', formatNaira(success.plan?.sellingPrice)],
            ['Status', '✓ Active'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-slate-400">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccess(null); setConfirmed(false); setPlan(null) }}
          className="btn-primary w-full justify-center py-3">Pay again</button>
      </div>
    )
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">TV Subscription</h2>
        <p className="text-slate-400 text-sm">Renew your cable subscription instantly</p>
      </div>
      <div className="glass-card p-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">Wallet Balance</span>
        <span className="font-display font-bold">{formatNaira(user?.walletBalance || 0)}</span>
      </div>
      <div>
        <label className="input-label">Select Provider</label>
        <div className="grid grid-cols-4 gap-2">
          {TV_PROVIDERS.map((p) => (
            <button key={p.id} onClick={() => { setProvider(p.id); setConfirmed(false); setPlan(null) }}
              className={`py-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center gap-1
                ${provider === p.id ? 'bg-brand-purple/10 text-brand-purple border-brand-purple/40' : 'glass-card text-slate-400 hover:text-white hover:border-white/20'}`}>
              <span className="text-xl">{p.icon}</span>{p.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="input-label">Smartcard / IUC Number</label>
        <div className="flex gap-2">
          <input type="text" placeholder="Enter number" value={smartcard}
            onChange={(e) => { setSmartcard(e.target.value); setConfirmed(false) }}
            className="input-field flex-1" />
          <button onClick={handleConfirm} disabled={!smartcard}
            className="btn-primary px-4 disabled:opacity-60 flex-shrink-0">
            Continue
          </button>
        </div>
      </div>
      {confirmed && (
        <div className="glass-card p-4 border-yellow-400/20 animate-slide-up" style={{ borderColor: 'rgba(250,204,21,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium uppercase tracking-wider">Double-check before you pay</span>
          </div>
          <p className="text-sm text-white">Smartcard: <span className="font-mono">{smartcard}</span></p>
          <p className="text-xs text-slate-400 mt-1">We can't pre-verify this number with your provider. Please confirm it's correct — payments to a wrong smartcard can't be reversed.</p>
        </div>
      )}
      <div>
        <label className="input-label">Select Plan</label>
        {loadingPlans ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-12 glass-card animate-pulse rounded-xl" />)}</div>
        ) : plansError ? (
          <div className="glass-card p-4 text-red-400 text-sm border border-red-500/20">{plansError}</div>
        ) : plans.length === 0 ? (
          <div className="glass-card p-4 text-slate-400 text-sm text-center">No active plans for this provider yet.</div>
        ) : (
          <div className="space-y-2">
            {plans.map((p) => (
              <button key={p.id} onClick={() => setPlan(p)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all
                  ${plan?.id === p.id ? 'bg-brand-purple/10 border-brand-purple/40 text-white' : 'glass-card text-slate-300 hover:border-white/20'}`}>
                <span className="font-medium">{p.name}</span>
                <span className="font-bold text-brand-purple">{formatNaira(p.sellingPrice)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      {plan && confirmed && (
        <button onClick={handlePay} disabled={loading}
          className="btn-primary w-full justify-center gap-2 py-3.5 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</span>
            : <><Tv size={17} />Pay {formatNaira(plan.sellingPrice)}</>}
        </button>
      )}
    </div>
  )
}
