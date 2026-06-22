import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Wifi, Phone, Zap, Tv, Plus, ArrowRight, TrendingUp, ArrowUpRight, ArrowDownLeft, Copy, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { walletAPI, referralAPI } from '../utils/api'
import { formatNaira, formatDateShort, txStatusColor, txStatusLabel, TX_TYPES } from '../utils/helpers'
import toast from 'react-hot-toast'

const QUICK_ACTIONS = [
  { to: '/dashboard/buy-data', icon: Wifi, label: 'Buy Data', color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
  { to: '/dashboard/buy-airtime', icon: Phone, label: 'Airtime', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { to: '/dashboard/electricity', icon: Zap, label: 'Electricity', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  { to: '/dashboard/tv', icon: Tv, label: 'TV Sub', color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
]

export default function Dashboard() {
  const { user, updateUser } = useAuth()
  const [balance, setBalance] = useState(user?.walletBalance || 0)
  const [transactions, setTransactions] = useState([])
  const [referral, setReferral] = useState(null)
  const [loadingTx, setLoadingTx] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showBalance, setShowBalance] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [balRes, txRes, refRes] = await Promise.allSettled([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
        referralAPI.getInfo(),
      ])

      if (balRes.status === 'fulfilled') {
        const bal = balRes.value.data.balance
        setBalance(bal)
        updateUser({ walletBalance: bal })
      }
      if (txRes.status === 'fulfilled') {
        setTransactions(txRes.value.data.transactions?.slice(0, 5) || [])
      }
      if (refRes.status === 'fulfilled') {
        setReferral(refRes.value.data)
      }
    } catch (e) {
      // fail silently for demo
    } finally {
      setLoadingTx(false)
    }
  }

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${referral?.code || user?.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  // Demo transactions if backend not connected
  const demoTx = [
    { _id: '1', type: 'data', description: 'MTN 2GB Data — 08012345678', amount: 850, status: 'success', createdAt: new Date(Date.now() - 300000).toISOString() },
    { _id: '2', type: 'wallet_fund', description: 'Wallet Funding via Paystack', amount: 5000, status: 'success', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { _id: '3', type: 'electricity', description: 'AEDC Prepaid — Meter 1234', amount: 2000, status: 'success', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { _id: '4', type: 'airtime', description: 'Airtel Airtime — 09012345678', amount: 500, status: 'pending', createdAt: new Date(Date.now() - 172800000).toISOString() },
  ]
  const displayTx = transactions.length > 0 ? transactions : demoTx

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Greeting */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">Here's your account overview</p>
      </div>

      {/* Wallet card + quick stats row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Main wallet card */}
        <div className="md:col-span-2 rounded-2xl p-6 relative overflow-hidden"
             style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1E2A5E 50%, #312E81 100%)' }}>
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
               style={{ background: 'radial-gradient(circle, #6366F1, transparent)', transform: 'translate(30%, -30%)' }} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Total Balance</p>
                <div className="flex items-center gap-3">
                  <p className="font-display text-3xl font-bold text-white">
                    {showBalance ? formatNaira(balance) : '₦ ••••••'}
                  </p>
                  <button onClick={() => setShowBalance(!showBalance)}
                    className="text-white/40 hover:text-white transition-colors text-xs">
                    {showBalance ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
              <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-400 to-yellow-500 opacity-90 flex-shrink-0" />
            </div>

            <div className="flex gap-3">
              <Link to="/dashboard/fund-wallet"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white">
                <Plus size={15} /> Fund wallet
              </Link>
              <Link to="/dashboard/transactions"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium text-white">
                <TrendingUp size={15} /> History
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-rows-2 gap-4">
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDownLeft size={15} className="text-emerald-400" />
              <span className="text-xs text-slate-400">Total spent</span>
            </div>
            <p className="font-display text-xl font-bold text-white">₦18,350</p>
            <p className="text-xs text-slate-500 mt-0.5">This month</p>
          </div>
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUpRight size={15} className="text-brand-blue" />
              <span className="text-xs text-slate-400">Transactions</span>
            </div>
            <p className="font-display text-xl font-bold text-white">24</p>
            <p className="text-xs text-slate-500 mt-0.5">This month</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="font-display font-semibold text-sm text-slate-400 uppercase tracking-wider mb-3">Quick actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon
            return (
              <Link key={action.to} to={action.to}
                className="glass-card p-4 flex flex-col items-center gap-2.5 hover:border-white/15 transition-all duration-200 hover:-translate-y-0.5 group">
                <div className={`w-11 h-11 rounded-xl ${action.bg} flex items-center justify-center`}>
                  <Icon size={20} className={action.color} />
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                  {action.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent transactions + Referral */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Transactions */}
        <div className="md:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-base">Recent Transactions</h3>
            <Link to="/dashboard/transactions"
              className="text-xs text-brand-blue hover:text-brand-cyan flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {loadingTx ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/5 animate-pulse" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse" />
                    <div className="h-2.5 w-1/3 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {displayTx.map((tx) => {
                const typeInfo = TX_TYPES[tx.type] || { icon: '💳', label: tx.type }
                const isCredit = ['wallet_fund', 'referral'].includes(tx.type)
                return (
                  <div key={tx._id} className="flex items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base flex-shrink-0">
                      {typeInfo.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{tx.description || typeInfo.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500">{formatDateShort(tx.createdAt)}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${txStatusColor(tx.status)}`}>
                          {txStatusLabel(tx.status)}
                        </span>
                      </div>
                    </div>
                    <span className={`text-sm font-semibold flex-shrink-0 ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {isCredit ? '+' : '−'}{formatNaira(tx.amount)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Referral card */}
        <div className="glass-card p-5 flex flex-col">
          <h3 className="font-display font-semibold text-base mb-1">Referral Bonus</h3>
          <p className="text-xs text-slate-400 mb-4">Invite friends, earn wallet credits</p>

          <div className="rounded-xl bg-brand-blue/10 border border-brand-blue/20 p-3 mb-4">
            <p className="text-xs text-slate-400 mb-1">Your referral code</p>
            <p className="font-display text-lg font-bold text-brand-cyan tracking-wider">
              {referral?.code || user?.referralCode || 'AHD-0000'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="font-display text-xl font-bold text-white">{referral?.count || 0}</p>
              <p className="text-xs text-slate-400 mt-0.5">Referrals</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="font-display text-xl font-bold text-emerald-400">
                {formatNaira(referral?.earnings || 0)}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Earned</p>
            </div>
          </div>

          <button onClick={copyReferralLink}
            className="btn-ghost w-full justify-center gap-2 mt-auto">
            {copied ? <><Check size={15} className="text-emerald-400" /> Copied!</> : <><Copy size={15} /> Copy invite link</>}
          </button>
        </div>
      </div>
    </div>
  )
}
