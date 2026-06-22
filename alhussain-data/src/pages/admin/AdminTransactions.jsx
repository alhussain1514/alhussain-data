import { useState, useEffect } from 'react'
import { Search, Download } from 'lucide-react'
import { adminAPI } from '../../utils/api'
import { formatNaira, formatDate, txStatusColor, txStatusLabel, TX_TYPES } from '../../utils/helpers'

const FILTERS = ['All', 'success', 'pending', 'failed']

const DEMO_TX = [
  { _id: '1', user: { name: 'Ahmad Musa', phone: '08012345678' }, type: 'data', amount: 850, status: 'success', reference: 'AHD-1001', createdAt: new Date(Date.now() - 180000).toISOString() },
  { _id: '2', user: { name: 'Fatima Bello', phone: '08023456789' }, type: 'wallet_fund', amount: 5000, status: 'success', reference: 'AHD-1002', createdAt: new Date(Date.now() - 600000).toISOString() },
  { _id: '3', user: { name: 'Ibrahim Sani', phone: '08034567890' }, type: 'electricity', amount: 3000, status: 'pending', reference: 'AHD-1003', createdAt: new Date(Date.now() - 900000).toISOString() },
  { _id: '4', user: { name: 'Zainab Yusuf', phone: '08045678901' }, type: 'tv', amount: 10500, status: 'success', reference: 'AHD-1004', createdAt: new Date(Date.now() - 1500000).toISOString() },
  { _id: '5', user: { name: 'Usman Garba', phone: '08056789012' }, type: 'airtime', amount: 200, status: 'failed', reference: 'AHD-1005', createdAt: new Date(Date.now() - 2400000).toISOString() },
  { _id: '6', user: { name: 'Aisha Lawal', phone: '08067890123' }, type: 'data', amount: 1500, status: 'success', reference: 'AHD-1006', createdAt: new Date(Date.now() - 3600000).toISOString() },
]

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState(DEMO_TX)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await adminAPI.getTransactions()
      setTransactions(res.data.transactions || DEMO_TX)
    } catch {
      setTransactions(DEMO_TX)
    } finally {
      setLoading(false)
    }
  }

  const filtered = transactions.filter((tx) => {
    const matchStatus = filter === 'All' || tx.status === filter
    const matchSearch = !search ||
      tx.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.user?.phone?.includes(search) ||
      tx.reference?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const totalVolume = transactions.filter(t => t.status === 'success').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Transactions</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {transactions.length} total · {formatNaira(totalVolume)} processed
          </p>
        </div>
        <button className="btn-ghost gap-2 text-xs">
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search by name, phone, or reference…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10" />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all
                ${filter === f ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/30' : 'glass-card text-slate-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-5 py-3 font-medium">Reference</th>
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td colSpan={6} className="px-5 py-4"><div className="h-4 bg-white/5 rounded animate-pulse w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No transactions found</td></tr>
              ) : (
                filtered.map((tx) => {
                  const typeInfo = TX_TYPES[tx.type] || { icon: '💳', label: tx.type }
                  return (
                    <tr key={tx._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 text-slate-300 font-mono text-xs">{tx.reference}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-white font-medium">{tx.user?.name}</p>
                        <p className="text-xs text-slate-500">{tx.user?.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-300">{typeInfo.icon} {typeInfo.label}</td>
                      <td className="px-5 py-3.5 font-medium text-white">{formatNaira(tx.amount)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${txStatusColor(tx.status)}`}>
                          {txStatusLabel(tx.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDate(tx.createdAt)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
