import { useState, useEffect } from 'react'
import { Wifi, Phone, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { vtuAPI } from '../utils/api'
import { NETWORK_LIST, NETWORKS, formatNaira } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

const DEMO_PLANS = {
  MTN: [
    { id: 'mtn-1', name: '500MB', duration: '1 Day', price: 150 },
    { id: 'mtn-2', name: '1GB', duration: '1 Day', price: 250 },
    { id: 'mtn-3', name: '2GB', duration: '30 Days', price: 850 },
    { id: 'mtn-4', name: '5GB', duration: '30 Days', price: 1500 },
    { id: 'mtn-5', name: '10GB', duration: '30 Days', price: 2500 },
    { id: 'mtn-6', name: '20GB', duration: '30 Days', price: 4500 },
  ],
  AIRTEL: [
    { id: 'air-1', name: '500MB', duration: '1 Day', price: 140 },
    { id: 'air-2', name: '1GB', duration: '7 Days', price: 300 },
    { id: 'air-3', name: '2GB', duration: '30 Days', price: 800 },
    { id: 'air-4', name: '5GB', duration: '30 Days', price: 1400 },
    { id: 'air-5', name: '10GB', duration: '30 Days', price: 2400 },
    { id: 'air-6', name: '25GB', duration: '30 Days', price: 5000 },
  ],
  GLO: [
    { id: 'glo-1', name: '1GB', duration: '1 Day', price: 200 },
    { id: 'glo-2', name: '2.5GB', duration: '30 Days', price: 700 },
    { id: 'glo-3', name: '5GB', duration: '30 Days', price: 1200 },
    { id: 'glo-4', name: '10GB', duration: '30 Days', price: 2000 },
    { id: 'glo-5', name: '15GB', duration: '30 Days', price: 3000 },
  ],
  '9MOBILE': [
    { id: '9m-1', name: '500MB', duration: '30 Days', price: 200 },
    { id: '9m-2', name: '1.5GB', duration: '30 Days', price: 500 },
    { id: '9m-3', name: '3GB', duration: '30 Days', price: 1000 },
    { id: '9m-4', name: '6GB', duration: '30 Days', price: 2000 },
  ],
}

export default function BuyData() {
  const { user, updateUser } = useAuth()
  const [selectedNetwork, setSelectedNetwork] = useState('MTN')
  const [plans, setPlans] = useState(DEMO_PLANS.MTN)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [phone, setPhone] = useState(user?.phone || '')
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    loadPlans(selectedNetwork)
    setSelectedPlan(null)
  }, [selectedNetwork])

  const loadPlans = async (network) => {
    setLoadingPlans(true)
    try {
      const res = await vtuAPI.getDataPlans(network)
      setPlans(res.data.plans)
    } catch {
      setPlans(DEMO_PLANS[network] || [])
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
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="w-20 h-20 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Data Purchased!</h2>
        <p className="text-slate-400 mb-6">
          {selectedPlan.name} has been sent to <span className="text-white">{phone}</span>
        </p>
        <div className="glass-card p-5 text-left mb-6 space-y-3">
          {[
            ['Network', selectedNetwork],
            ['Plan', selectedPlan.name],
            ['Duration', selectedPlan.duration],
            ['Phone', phone],
            ['Amount', formatNaira(selectedPlan.price)],
            ['Status', '✓ Success'],
            ['Reference', success.reference || 'AHD-' + Date.now()],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-sm">
              <span className="text-slate-400">{k}</span>
              <span className="text-white font-medium">{v}</span>
            </div>
          ))}
        </div>
        <button onClick={() => { setSuccess(null); setSelectedPlan(null) }}
          className="btn-primary w-full justify-center py-3">
          Buy more data
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-1">Buy Data Bundle</h2>
        <p className="text-slate-400 text-sm">Affordable data plans for all networks</p>
      </div>

      {/* Wallet balance */}
      <div className="glass-card p-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">Wallet Balance</span>
        <span className="font-display font-bold text-white">{formatNaira(user?.walletBalance || 0)}</span>
      </div>

      {/* Network selector */}
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

      {/* Phone number */}
      <div>
        <label className="input-label">Phone Number</label>
        <div className="relative">
          <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="tel" placeholder="08012345678"
            value={phone} onChange={(e) => setPhone(e.target.value)}
            className="input-field pl-10" />
        </div>
      </div>

      {/* Plans grid */}
      <div>
        <label className="input-label">Choose Plan</label>
        {loadingPlans ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 glass-card animate-pulse rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {plans.map((plan) => (
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

      {/* Summary + Buy */}
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
