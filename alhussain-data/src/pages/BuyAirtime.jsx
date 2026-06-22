import { useState } from 'react'
import { Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { vtuAPI } from '../utils/api'
import { NETWORK_LIST, NETWORKS, formatNaira } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

const QUICK_AMOUNTS = [100, 200, 500, 1000, 2000, 5000]

export default function BuyAirtime() {
  const { user, updateUser } = useAuth()
  const [network, setNetwork] = useState('MTN')
  const [phone, setPhone] = useState(user?.phone || '')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)

  const handleBuy = async () => {
    const amt = parseFloat(amount)
    if (!phone.match(/^0[7-9][0-1]\d{8}$/)) return toast.error('Enter a valid phone number')
    if (!amt || amt < 50) return toast.error('Minimum airtime is ₦50')
    if (amt > 50000) return toast.error('Maximum airtime is ₦50,000')
    if ((user?.walletBalance || 0) < amt) return toast.error('Insufficient balance. Fund your wallet.')

    setLoading(true)
    try {
      const res = await vtuAPI.buyAirtime({ network, phone, amount: amt })
      setSuccess({ network, phone, amount: amt, reference: res.data?.reference })
      updateUser({ walletBalance: (user?.walletBalance || 0) - amt })
      toast.success('Airtime sent successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Airtime Sent!</h2>
        <p className="text-slate-400 mb-6">
          {formatNaira(success.amount)} airtime sent to <span className="text-white">{success.phone}</span>
        </p>
        <div className="glass-card p-5 text-left mb-6 space-y-3">
          {[
            ['Network', NETWORKS[success.network].label],
            ['Phone', success.phone],
            ['Amount', formatNaira(success.amount)],
            ['Status', '✓ Success'],
            ['Reference', success.reference || 'AHD-' + Date.now()],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-slate-400">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccess(null); setAmount('') }}
          className="btn-primary w-full justify-center py-3">
          Buy more airtime
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-1">Buy Airtime</h2>
        <p className="text-slate-400 text-sm">Top up any Nigerian network instantly</p>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">Wallet Balance</span>
        <span className="font-display font-bold text-white">{formatNaira(user?.walletBalance || 0)}</span>
      </div>

      {/* Network */}
      <div>
        <label className="input-label">Select Network</label>
        <div className="grid grid-cols-4 gap-2">
          {NETWORK_LIST.map((net) => {
            const meta = NETWORKS[net]
            return (
              <button key={net} onClick={() => setNetwork(net)}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all
                  ${network === net
                    ? `${meta.bg} ${meta.text} border-current`
                    : 'glass-card text-slate-400 hover:border-white/20 hover:text-white'}`}>
                {meta.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="input-label">Phone Number</label>
        <div className="relative">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="tel" placeholder="08012345678"
            value={phone} onChange={(e) => setPhone(e.target.value)}
            className="input-field pl-10" />
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="input-label">Amount (₦)</label>
        <input type="number" placeholder="Enter amount e.g. 500"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          className="input-field" min="50" max="50000" />
        <div className="grid grid-cols-3 gap-2 mt-3">
          {QUICK_AMOUNTS.map((q) => (
            <button key={q} onClick={() => setAmount(String(q))}
              className={`py-2 rounded-xl text-sm font-medium transition-all
                ${amount === String(q) ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/40' : 'glass-card text-slate-400 hover:text-white hover:border-white/20'}`}>
              ₦{q.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {amount && parseFloat(amount) >= 50 && (
        <div className="glass-card p-4 space-y-3 animate-slide-up">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Network</span>
            <span className="text-white font-medium">{NETWORKS[network].label}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Phone</span>
            <span className="text-white font-medium">{phone || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Amount</span>
            <span className="font-display font-bold text-white">{formatNaira(parseFloat(amount))}</span>
          </div>
        </div>
      )}

      <button onClick={handleBuy} disabled={loading || !phone || !amount}
        className="btn-primary w-full justify-center gap-2 py-3.5 text-base disabled:opacity-60">
        {loading
          ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</span>
          : `Send Airtime${amount ? ' — ' + formatNaira(parseFloat(amount) || 0) : ''}`
        }
      </button>
    </div>
  )
}
