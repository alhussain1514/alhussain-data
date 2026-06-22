import { useState, useEffect } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import { walletAPI } from '../utils/api'
import { formatNaira, formatDate, txStatusColor, txStatusLabel, TX_TYPES } from '../utils/helpers'

const FILTERS = ['All', 'data', 'airtime', 'electricity', 'tv', 'wallet_fund', 'withdrawal']

const DEMO_TRANSACTIONS = [
  { _id: '1', type: 'data', description: 'MTN 2GB — 08012345678', amount: 850, status: 'success', createdAt: new Date(Date.now() - 300000).toISOString() },
  { _id: '2', type: 'wallet_fund', description: 'Wallet Funding via Paystack', amount: 5000, status: 'success', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: '3', type: 'electricity', description: 'AEDC Prepaid — Meter 12345678', amount: 2000, status: 'success', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: '4', type: 'airtime', description: 'Airtel Airtime — 09012345678', amount: 500, status: 'pending', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { _id: '5', type: 'tv', description: 'DStv Compact — 1234567890', amount: 10500, status: 'success', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { _id: '6', type: 'data', description: 'Glo 5GB — 08098765432', amount: 1200, status: 'failed', createdAt: new Date(Date.now() - 345600000).toISOString() },
  { _id: '7', type: 'wallet_fund', description: 'Wallet Funding via Paystack', amount: 10000, status: 'success', createdAt: new Date(Date.now() - 432000000).toISOString() },
  { _id: '8', type: 'referral', description: 'Referral Bonus — Friend joined', amount: 200, status: 'success', createdAt: new Date(Date.now() - 518400000).toISOString() },
]

export default function Transactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadTransactions()
  }, [page])

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const res = await walletAPI.getTransactions(page)
      setTransactions(res.data.transactions || [])
    } catch {
      setTransactions(DEMO_TRANSACTIONS)
    } finally {
      setLoading(false)
    }
  }

  const filtered = transactions.filter((tx) => {
    const matchType = filter === 'All' || tx.type === filter
    const matchSearch = !search || tx.description?.toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  const isCredit = (type) => ['wallet_fund', 'referral'].includes(type)

  const totalSpent = transactions
    .filter(tx => !isCredit(tx.type) && tx.status === 'success')
    .reduce((s, tx) => s + tx.amount, 0)
  const totalFunded = transactions
    .filter(tx => tx.type === 'wallet_fund' && tx.status === 'success')
    .reduce((s, tx) => s + tx.amount, 0)

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold mb-1">Transactions</h2>
          <p className="text-slate-400 text-sm">Your complete transaction history</p>
        </div>
        <button className="btn-ghost gap-2 text-xs">
          <Download size={14} /> Export
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-4 text-center">
          <p className="font-display text-xl font-bold text-white">{transactions.length}</p>
          <p className="text-xs text-slate-400 mt-0.5">Total</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-display text-lg font-bold text-red-400">{formatNaira(totalSpent)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Spent</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="font-display text-lg font-bold text-emerald-400">{formatNaira(totalFunded)}</p>
          <p className="text-xs text-slate-400 mt-0.5">Funded</p>
        </div>
      </div>

      {/* Filters + Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search transactions…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0
                ${filter === f ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/30' : 'glass-card text-slate-400 hover:text-white'}`}>
              {f === 'All' ? 'All' : TX_TYPES[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="glass-card divide-y divide-white/[0.04]">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4">
              <div className="w-10 h-10 rounded-xl bg-white/5 animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                <div className="h-2.5 w-1/3 bg-white/5 rounded animate-pulse" />
              </div>
              <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-slate-400 text-sm">No transactions found</p>
          </div>
        ) : (
          filtered.map((tx) => {
            const typeInfo = TX_TYPES[tx.type] || { icon: '💳', label: tx.type }
            const credit = isCredit(tx.type)
            return (
              <div key={tx._id} className="flex items-center gap-3 p-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg flex-shrink-0">
                  {typeInfo.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{tx.description || typeInfo.label}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-xs text-slate-500">{formatDate(tx.createdAt)}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${txStatusColor(tx.status)}`}>
                      {txStatusLabel(tx.status)}
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-semibold flex-shrink-0 ${credit ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {credit ? '+' : '−'}{formatNaira(tx.amount)}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
