import { useState } from 'react'
import { Zap, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { vtuAPI } from '../utils/api'
import { DISCOS, formatNaira } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

const QUICK_AMOUNTS = [1000, 2000, 3000, 5000, 10000, 20000]

export default function PayElectricity() {
  const { user, updateUser } = useAuth()
  const [disco, setDisco] = useState('')
  const [meterType, setMeterType] = useState('prepaid')
  const [meterNumber, setMeterNumber] = useState('')
  const [amount, setAmount] = useState('')
  const [verified, setVerified] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  // Demboss does not offer a meter pre-verification endpoint, so we can't
  // confirm the customer's name before payment. We ask the customer to
  // confirm the meter number themselves instead of faking a verified name.
  const handleConfirm = () => {
    if (!disco) return toast.error('Select a DISCO')
    if (!meterNumber || meterNumber.length < 10) return toast.error('Enter a valid meter number')
    setVerified({ meterNumber, confirmedByUser: true })
  }

  const handlePay = async () => {
    const amt = parseFloat(amount)
    if (!verified) return toast.error('Verify meter first')
    if (!amt || amt < 500) return toast.error('Minimum amount is ₦500')
    if ((user?.walletBalance || 0) < amt) return toast.error('Insufficient balance')
    setLoading(true)
    try {
      const res = await vtuAPI.payElectricity({ disco, meterType, meterNumber, amount: amt })
      setSuccess({ ...res.data, disco, amount: amt, meterNumber, meterType })
      updateUser({ walletBalance: (user?.walletBalance || 0) - amt })
      toast.success('Electricity token generated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-yellow-400/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">⚡</span>
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Token Generated!</h2>
        <p className="text-slate-400 mb-6">Your electricity token has been sent</p>
        {success.token && (
          <div className="glass-card p-5 mb-4">
            <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Your Token</p>
            <p className="font-display text-2xl font-bold tracking-widest text-brand-cyan">{success.token}</p>
          </div>
        )}
        <div className="glass-card p-5 text-left mb-6 space-y-3">
          {[
            ['DISCO', DISCOS.find(d => d.id === success.disco)?.label || success.disco],
            ['Meter', success.meterNumber],
            ['Type', success.meterType === 'prepaid' ? 'Prepaid' : 'Postpaid'],
            ['Amount', formatNaira(success.amount)],
            ['Status', '✓ Success'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-slate-400">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccess(null); setVerified(null); setMeterNumber(''); setAmount('') }}
          className="btn-primary w-full justify-center py-3">
          Pay another bill
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-1">Pay Electricity Bill</h2>
        <p className="text-slate-400 text-sm">Get your prepaid token or pay postpaid bill</p>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">Wallet Balance</span>
        <span className="font-display font-bold text-white">{formatNaira(user?.walletBalance || 0)}</span>
      </div>

      {/* DISCO select */}
      <div>
        <label className="input-label">Select DISCO</label>
        <select value={disco} onChange={(e) => { setDisco(e.target.value); setVerified(null) }}
          className="input-field">
          <option value="">-- Select your distribution company --</option>
          {DISCOS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
        </select>
      </div>

      {/* Meter type */}
      <div>
        <label className="input-label">Meter Type</label>
        <div className="grid grid-cols-2 gap-2">
          {['prepaid', 'postpaid'].map((t) => (
            <button key={t} onClick={() => { setMeterType(t); setVerified(null) }}
              className={`py-3 rounded-xl border text-sm font-semibold capitalize transition-all
                ${meterType === t ? 'bg-brand-blue/10 text-brand-blue border-brand-blue/40' : 'glass-card text-slate-400 hover:text-white hover:border-white/20'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Meter number */}
      <div>
        <label className="input-label">Meter Number</label>
        <div className="flex gap-2">
          <input type="text" placeholder="Enter meter number"
            value={meterNumber} onChange={(e) => { setMeterNumber(e.target.value); setVerified(null) }}
            className="input-field flex-1" />
          <button onClick={handleConfirm} disabled={!disco || !meterNumber}
            className="btn-primary px-4 gap-2 disabled:opacity-60 flex-shrink-0">
            <Search size={15} /> Continue
          </button>
        </div>
      </div>

      {/* Self-confirmation notice — this provider has no meter lookup, so we
          can't show the customer's real name before payment. */}
      {verified && (
        <div className="glass-card p-4 border-yellow-400/20 animate-slide-up" style={{ borderColor: 'rgba(250,204,21,0.2)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium uppercase tracking-wider">Double-check before you pay</span>
          </div>
          <p className="text-sm text-white">Meter number: <span className="font-mono">{verified.meterNumber}</span></p>
          <p className="text-xs text-slate-400 mt-1">We can't pre-verify this meter with your provider. Please confirm it's correct — payments to a wrong meter can't be reversed.</p>
        </div>
      )}

      {/* Amount */}
      {verified && (
        <>
          <div className="animate-slide-up">
            <label className="input-label">Amount (₦)</label>
            <input type="number" placeholder="Enter amount e.g. 2000"
              value={amount} onChange={(e) => setAmount(e.target.value)}
              className="input-field" min="500" />
            <div className="grid grid-cols-3 gap-2 mt-3">
              {QUICK_AMOUNTS.map((q) => (
                <button key={q} onClick={() => setAmount(String(q))}
                  className={`py-2 rounded-xl text-sm font-medium transition-all
                    ${amount === String(q) ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/30' : 'glass-card text-slate-400 hover:text-white hover:border-white/20'}`}>
                  ₦{q.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handlePay} disabled={loading || !amount}
            className="btn-primary w-full justify-center gap-2 py-3.5 text-base disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #D97706, #EAB308)' }}>
            {loading
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</span>
              : <><Zap size={17} />Pay {amount ? formatNaira(parseFloat(amount)) : 'Electricity Bill'}</>
            }
          </button>
        </>
      )}
    </div>
  )
}
