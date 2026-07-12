import { useState, useEffect } from 'react'
import { Users, Receipt, TrendingUp, Wallet, ArrowUpRight, RefreshCw, Server, AlertTriangle } from 'lucide-react'
import { adminAPI } from '../../utils/api'
import { formatNaira, formatDateShort, txStatusColor, txStatusLabel, TX_TYPES } from '../../utils/helpers'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [providerBalance, setProviderBalance] = useState(null)
  const [providerError, setProviderError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true); setError(null)
    try {
      const res = await adminAPI.getDashboardStats()
      setStats(res.data.stats)
      setRecent(res.data.recentTransactions || [])
    } catch { setError('Failed to load. Check your connection.') }
    finally { setLoading(false) }

    try {
      const balRes = await adminAPI.getProviderBalance()
      setProviderBalance(balRes.data)
      setProviderError(null)
    } catch {
      setProviderError('Could not reach Demboss. Check DEMBOSS_API_TOKEN on the server.')
    }
  }

  const cards = [
    { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() ?? '0', sub: '+' + (stats?.newUsersToday ?? 0) + ' today', icon: Users, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
    { label: 'Transactions', value: stats?.totalTransactions?.toLocaleString() ?? '0', sub: 'All time', icon: Receipt, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
    { label: 'Total Revenue', value: formatNaira(stats?.totalRevenue ?? 0), sub: '+' + formatNaira(stats?.revenueToday ?? 0) + ' today', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { label: 'Wallet Liability', value: formatNaira(stats?.walletBalanceSum ?? 0), sub: 'Sum of all balances', icon: Wallet, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
  ]

  const statusBreakdown = stats?.statusBreakdown || { pending: 0, success: 0, failed: 0 }
  const statusTotal = statusBreakdown.pending + statusBreakdown.success + statusBreakdown.failed || 1

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Admin Overview</h2>
          <p className="text-slate-400 text-sm">Real-time platform stats</p>
        </div>
        <button onClick={load} className="btn-ghost gap-2 text-sm">
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>
      {error && <div className="glass-card p-4 text-red-400 text-sm border border-red-500/20">{error}</div>}

      {/* Demboss provider wallet balance — so admin knows when to top up */}
      <div className={'glass-card p-5 border ' + (providerError ? 'border-red-500/20' : 'border-brand-cyan/10')}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center">
              <Server size={18} className="text-brand-cyan" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Demboss Wallet Balance</p>
              {providerError ? (
                <p className="text-sm text-red-400 flex items-center gap-1.5 mt-0.5"><AlertTriangle size={13} /> {providerError}</p>
              ) : providerBalance ? (
                <p className="font-display text-xl font-bold text-white mt-0.5">₦{providerBalance.balance}</p>
              ) : (
                <div className="h-6 w-32 bg-white/5 rounded animate-pulse mt-1" />
              )}
            </div>
          </div>
          {providerBalance?.name && <p className="text-xs text-slate-500">{providerBalance.name}</p>}
        </div>
        <p className="text-xs text-slate-500 mt-3">This is your prepaid balance on Demboss's platform — top it up directly on their dashboard before it runs out, or purchases will start failing.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={'w-10 h-10 rounded-xl ' + c.bg + ' flex items-center justify-center'}>
                  <Icon size={19} className={c.color} />
                </div>
                <ArrowUpRight size={14} className="text-slate-600" />
              </div>
              {loading ? <div className="h-7 w-28 bg-white/5 rounded animate-pulse mb-1" /> : <p className="font-display text-2xl font-bold text-white">{c.value}</p>}
              <p className="text-xs text-slate-400 mt-1">{c.label}</p>
              <p className="text-xs text-emerald-400 mt-1">{c.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Transaction status breakdown — pending / success / failed at a glance */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4">Transaction Status Breakdown</h3>
        <div className="flex h-3 rounded-full overflow-hidden mb-4 bg-white/5">
          {statusBreakdown.success > 0 && <div className="bg-emerald-400" style={{ width: `${(statusBreakdown.success / statusTotal) * 100}%` }} />}
          {statusBreakdown.pending > 0 && <div className="bg-yellow-400" style={{ width: `${(statusBreakdown.pending / statusTotal) * 100}%` }} />}
          {statusBreakdown.failed > 0 && <div className="bg-red-400" style={{ width: `${(statusBreakdown.failed / statusTotal) * 100}%` }} />}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            ['success', 'Successful', 'text-emerald-400', 'bg-emerald-400/10'],
            ['pending', 'Pending', 'text-yellow-400', 'bg-yellow-400/10'],
            ['failed', 'Failed', 'text-red-400', 'bg-red-400/10'],
          ].map(([key, label, textColor, bg]) => (
            <div key={key} className={'rounded-xl p-3 ' + bg}>
              <p className={'font-display text-xl font-bold ' + textColor}>{statusBreakdown[key].toLocaleString()}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold">Recent Transactions</h3>
          <a href="/admin/transactions" className="text-xs text-brand-blue hover:text-brand-cyan">View all</a>
        </div>
        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map((i) => (<div key={i} className="flex gap-3"><div className="w-7 h-7 rounded-full bg-white/5 animate-pulse" /><div className="flex-1 h-3 mt-2 bg-white/5 rounded animate-pulse" /><div className="h-3 mt-2 w-20 bg-white/5 rounded animate-pulse" /></div>))}</div>
        ) : recent.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.04]"><th className="pb-3 font-medium">User</th><th className="pb-3 font-medium">Type</th><th className="pb-3 font-medium">Amount</th><th className="pb-3 font-medium">Status</th><th className="pb-3 font-medium">Date</th></tr></thead>
              <tbody>
                {recent.map((tx) => {
                  const t = TX_TYPES[tx.type] || { icon: '📦', label: tx.type }
                  return (
                    <tr key={tx._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                      <td className="py-3"><div className="flex items-center gap-2"><div className="w-7 h-7 rounded-full bg-brand-blue/15 flex items-center justify-center text-xs font-bold text-brand-blue">{tx.user?.name?.[0]?.toUpperCase() || '?'}</div><span className="text-white font-medium">{tx.user?.name || 'Unknown'}</span></div></td>
                      <td className="py-3 text-slate-300 text-xs">{t.icon} {t.label}</td>
                      <td className="py-3 font-medium text-white">{formatNaira(tx.amount)}</td>
                      <td className="py-3"><span className={'text-xs px-2 py-0.5 rounded-md font-medium ' + txStatusColor(tx.status)}>{txStatusLabel(tx.status)}</span></td>
                      <td className="py-3 text-slate-500 text-xs">{formatDateShort(tx.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
