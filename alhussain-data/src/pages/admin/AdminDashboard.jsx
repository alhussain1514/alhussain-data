import { useState, useEffect } from 'react'
import { Users, Receipt, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { adminAPI } from '../../utils/api'
import { formatNaira, formatDateShort, txStatusColor, txStatusLabel, TX_TYPES } from '../../utils/helpers'

const DEMO_STATS = {
  totalUsers: 1284,
  newUsersToday: 23,
  totalTransactions: 8941,
  totalRevenue: 4250800,
  revenueToday: 128500,
  walletBalanceSum: 1820400,
}

const DEMO_RECENT = [
  { _id: '1', user: { name: 'Ahmad Musa' }, type: 'data', amount: 850, status: 'success', createdAt: new Date(Date.now() - 180000).toISOString() },
  { _id: '2', user: { name: 'Fatima Bello' }, type: 'wallet_fund', amount: 5000, status: 'success', createdAt: new Date(Date.now() - 600000).toISOString() },
  { _id: '3', user: { name: 'Ibrahim Sani' }, type: 'electricity', amount: 3000, status: 'pending', createdAt: new Date(Date.now() - 900000).toISOString() },
  { _id: '4', user: { name: 'Zainab Yusuf' }, type: 'tv', amount: 10500, status: 'success', createdAt: new Date(Date.now() - 1500000).toISOString() },
  { _id: '5', user: { name: 'Usman Garba' }, type: 'airtime', amount: 200, status: 'failed', createdAt: new Date(Date.now() - 2400000).toISOString() },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(DEMO_STATS)
  const [recent, setRecent] = useState(DEMO_RECENT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    try {
      const res = await adminAPI.getDashboardStats()
      setStats(res.data.stats)
      setRecent(res.data.recentTransactions || DEMO_RECENT)
    } catch {
      // demo fallback already set
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    { label: 'Total Users', value: stats.totalUsers?.toLocaleString(), sub: `+${stats.newUsersToday} today`, icon: Users, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { label: 'Total Transactions', value: stats.totalTransactions?.toLocaleString(), sub: 'All time', icon: Receipt, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
    { label: 'Total Revenue', value: formatNaira(stats.totalRevenue), sub: `+${formatNaira(stats.revenueToday)} today`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Wallet Liability', value: formatNaira(stats.walletBalanceSum), sub: 'Sum of all balances', icon: Wallet, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  ]

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">Admin Overview</h2>
        <p className="text-slate-400 text-sm mt-0.5">Platform performance and activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                  <Icon size={19} className={c.color} />
                </div>
              </div>
              <p className="font-display text-2xl font-bold text-white">{c.value}</p>
              <p className="text-xs text-slate-400 mt-1">{c.label}</p>
              <p className="text-xs text-emerald-400 mt-1.5 flex items-center gap-1">
                <ArrowUpRight size={11} />{c.sub}
              </p>
            </div>
          )
        })}
      </div>

      {/* Recent transactions */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-base">Recent Transactions</h3>
          <a href="/admin/transactions" className="text-xs text-brand-blue hover:text-brand-cyan transition-colors">View all →</a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06]">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((tx) => {
                const typeInfo = TX_TYPES[tx.type] || { icon: '💳', label: tx.type }
                return (
                  <tr key={tx._id} className="border-b border-white/[0.04] last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {tx.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="text-white font-medium">{tx.user?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-300">{typeInfo.icon} {typeInfo.label}</td>
                    <td className="py-3 font-medium text-white">{formatNaira(tx.amount)}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${txStatusColor(tx.status)}`}>
                        {txStatusLabel(tx.status)}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 text-xs">{formatDateShort(tx.createdAt)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
