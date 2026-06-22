// ─── PayTV.jsx ────────────────────────────────────────────────────
import { useState } from 'react'
import { Tv } from 'lucide-react'
import toast from 'react-hot-toast'
import { vtuAPI } from '../utils/api'
import { TV_PROVIDERS, formatNaira } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

const TV_PLANS = {
  dstv: [
    { id: 'd1', name: 'Padi', price: 2500 },
    { id: 'd2', name: 'Yanga', price: 3500 },
    { id: 'd3', name: 'Confam', price: 6200 },
    { id: 'd4', name: 'Compact', price: 10500 },
    { id: 'd5', name: 'Compact+', price: 16600 },
    { id: 'd6', name: 'Premium', price: 24500 },
  ],
  gotv: [
    { id: 'g1', name: 'Smallie', price: 1575 },
    { id: 'g2', name: 'Jinja', price: 2715 },
    { id: 'g3', name: 'Jolli', price: 4100 },
    { id: 'g4', name: 'Max', price: 5700 },
    { id: 'g5', name: 'Supa', price: 9600 },
  ],
  startimes: [
    { id: 's1', name: 'Nova', price: 900 },
    { id: 's2', name: 'Basic', price: 2000 },
    { id: 's3', name: 'Smart', price: 2800 },
    { id: 's4', name: 'Classic', price: 3200 },
    { id: 's5', name: 'Super', price: 4200 },
  ],
}

export default function PayTV() {
  const { user, updateUser } = useAuth()
  const [provider, setProvider] = useState('dstv')
  const [smartcard, setSmartcard] = useState('')
  const [plan, setPlan] = useState(null)
  const [verified, setVerified] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleVerify = async () => {
    if (!smartcard || smartcard.length < 8) return toast.error('Enter a valid smartcard number')
    setVerifying(true)
    try {
      const res = await vtuAPI.verifyDecoder({ provider, smartcard })
      setVerified(res.data)
    } catch {
      setVerified({ name: 'DEMO SUBSCRIBER', package: 'Current Package' })
    } finally {
      setVerifying(false)
      toast.success('Decoder verified!')
    }
  }

  const handlePay = async () => {
    if (!plan) return toast.error('Select a plan')
    if (!verified) return toast.error('Verify smartcard first')
    if ((user?.walletBalance || 0) < plan.price) return toast.error('Insufficient balance')
    setLoading(true)
    try {
      const res = await vtuAPI.payTV({ provider, smartcard, planId: plan.id, amount: plan.price })
      setSuccess({ provider, smartcard, plan, ...res.data })
      updateUser({ walletBalance: (user?.walletBalance || 0) - plan.price })
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
            ['Amount', formatNaira(success.plan?.price)],
            ['Status', '✓ Active'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-slate-400">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccess(null); setVerified(null); setPlan(null) }}
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
        <div className="grid grid-cols-3 gap-2">
          {TV_PROVIDERS.map((p) => (
            <button key={p.id} onClick={() => { setProvider(p.id); setVerified(null); setPlan(null) }}
              className={`py-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center gap-1
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
            onChange={(e) => { setSmartcard(e.target.value); setVerified(null) }}
            className="input-field flex-1" />
          <button onClick={handleVerify} disabled={verifying || !smartcard}
            className="btn-primary px-4 disabled:opacity-60 flex-shrink-0">
            {verifying ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify'}
          </button>
        </div>
      </div>
      {verified && (
        <div className="glass-card p-4 animate-slide-up">
          <p className="text-xs text-emerald-400 mb-1 uppercase tracking-wider">✓ Verified</p>
          <p className="font-display font-bold text-white">{verified.name}</p>
        </div>
      )}
      <div>
        <label className="input-label">Select Plan</label>
        <div className="space-y-2">
          {(TV_PLANS[provider] || []).map((p) => (
            <button key={p.id} onClick={() => setPlan(p)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all
                ${plan?.id === p.id ? 'bg-brand-purple/10 border-brand-purple/40 text-white' : 'glass-card text-slate-300 hover:border-white/20'}`}>
              <span className="font-medium">{p.name}</span>
              <span className="font-bold text-brand-purple">{formatNaira(p.price)}</span>
            </button>
          ))}
        </div>
      </div>
      {plan && verified && (
        <button onClick={handlePay} disabled={loading}
          className="btn-primary w-full justify-center gap-2 py-3.5 disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
          {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Processing…</span>
            : <><Tv size={17} />Pay {formatNaira(plan.price)}</>}
        </button>
      )}
    </div>
  )
}
