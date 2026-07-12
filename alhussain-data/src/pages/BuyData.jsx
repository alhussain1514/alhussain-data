import { useState, useEffect } from 'react'
import { Wifi, Phone, ArrowRight, Download } from 'lucide-react'
import toast from 'react-hot-toast'
import { vtuAPI } from '../utils/api'
import { NETWORK_LIST, NETWORKS, formatNaira } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

export default function BuyData() {
  const { user, updateUser } = useAuth()
  const [selectedNetwork, setSelectedNetwork] = useState('MTN')
  const [selectedType, setSelectedType] = useState('ALL')
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [phone, setPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [plansError, setPlansError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadPlans(selectedNetwork)
    setSelectedPlan(null)
    setSelectedType('ALL')
  }, [selectedNetwork])

  const loadPlans = async (network) => {
    setLoadingPlans(true)
    setPlansError(null)
    try {
      const res = await vtuAPI.getDataPlans(network)
      setPlans(res.data.plans)
    } catch {
      setPlans([])
      setPlansError('Could not load plans. Check your connection and try again.')
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleBuy = async () => {
    if (!selectedPlan) return toast.error('Select a data plan')
    if (!phone.match(/^0[7-9][0-1]\d{8}$/)) return toast.error('Enter a valid phone number')
    if ((user?.walletBalance || 0) < selectedPlan.price) return toast.error('Insufficient wallet balance. Please fund your wallet.')

    setLoading(true)
    try {
      const res = await vtuAPI.buyData({
        network: selectedNetwork,
        planId: selectedPlan.id,
        phone,
        amount: selectedPlan.price,
      })
      setSuccess(res.data)
      updateUser({ walletBalance: (user?.walletBalance || 0) - selectedPlan.price })
      toast.success('Data purchased successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    const reference = success.reference || 'AHD-' + Date.now()
    const dateStr = new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })

    return (
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-6 no-print">
          <div className="w-20 h-20 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Data Purchased!</h2>
          <p className="text-slate-400">
            {selectedPlan.name} has been sent to <span className="text-white">{phone}</span>
          </p>
        </div>

        <div id="receipt-print-area" className="glass-card p-6 text-left mb-6">
          <div className="text-center mb-5 pb-4 border-b border-white/10">
            <p className="font-display font-bold text-lg">AL-HUSSAIN <span className="text-brand-cyan">DATA</span></p>
            <p className="text-xs text-slate-400 mt-1">Payment Receipt</p>
          </div>
          <div className="space-y-3">
            {[
              ['Status', '✓ Successful'],
              ['Reference', reference],
              ['Date', dateStr],
              ['Network', selectedNetwork],
              ['Plan', selectedPlan.name],
              ['Duration', selectedPlan.duration],
              ['Phone Number', phone],
              ['Amount Paid', formatNaira(selectedPlan.price)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-400">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 text-center mt-5 pt-4 border-t border-white/10">
            Thank you for using AL-HUSSAIN DATA
          </p>
        </div>

        <div className="flex gap-3 no-print">
          <button onClick={() => window.print()}
            className="btn-ghost flex-1 justify-center gap-2">
            <Download size={16} /> Download Receipt
          </button>
          <button onClick={() => { setSuccess(null); setSelectedPlan(null) }}
            className="btn-primary flex-1 justify-center">
            Buy more data
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-1">Buy Data Bundle</h2>
        <p className="text-slate-400 text-sm">Affordable data plans for all networks</p>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">Wallet Balance</span>
        <span className="font-display font-bold text-white">{formatNaira(user?.walletBalance || 0)}</span>
      </div>

      <div>
        <label className="input-label">Select Network</label>
        <div className="grid grid-cols-4 gap-2">
          {NETWORK_LIST.map((net) => {
            const meta = NETWORKS[net]
            return (
              <button key={net}
                onClick={() => setSelectedNetwork(net)}
                className={`p-3 rounded-xl border text-sm font-semibold transition-all
                  ${selectedNetwork === net
                    ? `${meta.bg} ${meta.text} border-current`
                    : 'glass-card text-slate-400 hover:border-white/20 hover:text-white'}`}>
                {meta.label}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="input-label">Phone Number</label>
        <div className="relative">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="tel" placeholder="08012345678"
            value={phone} onChange={(e) => setPhone(e.target.value)}
            className="input-field pl-10" />
        </div>
      </div>

      <div>
        <label className="input-label">Plan Type</label>
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'SME', 'GIFTING', 'CORPORATE'].map((t) => (
            <button key={t} onClick={() => setSelectedType(t)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all
                ${selectedType === t
                  ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30'
                  : 'glass-card text-slate-400 hover:text-white'}`}>
              {t === 'ALL' ? 'All Plans' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="input-label">Choose Plan</label>
        {loadingPlans ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 glass-card animate-pulse rounded-xl" />
            ))}
          </div>
        ) : plansError ? (
          <div className="glass-card p-4 text-red-400 text-sm border border-red-500/20">{plansError}</div>
        ) : plans.filter((p) => selectedType === 'ALL' || (p.planType || '').toUpperCase() === selectedType).length === 0 ? (
          <div className="glass-card p-4 text-slate-400 text-sm text-center">No active plans in this category yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {plans.filter((p) => selectedType === 'ALL' || (p.planType || '').toUpperCase() === selectedType).map((plan) => (
              <button key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`p-4 rounded-xl border text-left transition-all duration-150
                  ${selectedPlan?.id === plan.id
                    ? 'border-brand-blue/50 bg-brand-blue/10'
                    : 'glass-card hover:border-white/20'}`}>
                <p className="font-display font-bold text-white text-lg leading-tight">{plan.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{plan.duration}</p>
                <p className={`font-semibold text-sm mt-2 ${selectedPlan?.id === plan.id ? 'text-brand-cyan' : 'text-slate-300'}`}>
                  {formatNaira(plan.price)}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedPlan && (
        <div className="glass-card p-5 space-y-4 animate-slide-up">
          <h3 className="font-display font-semibold text-sm text-slate-400 uppercase tracking-wider">Order Summary</h3>
          <div className="space-y-2">
            {[
              ['Plan', `${selectedPlan.name} — ${selectedPlan.duration}`],
              ['Network', NETWORKS[selectedNetwork].label],
              ['Phone', phone || 'Not entered'],
              ['Amount', formatNaira(selectedPlan.price)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-400">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>
          <button onClick={handleBuy} disabled={loading || !phone}
            className="btn-primary w-full justify-center gap-2 py-3.5 text-base disabled:opacity-60">
            {loading
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</span>
              : <><Wifi size={17} />Buy {selectedPlan.name} for {formatNaira(selectedPlan.price)}</>
            }
          </button>
        </div>
      )}
    </div>
  )
}
