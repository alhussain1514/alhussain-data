import { useState, useEffect } from 'react'
import { Search, X, RefreshCw } from 'lucide-react'
import { adminAPI } from '../../utils/api'
import { formatNaira, formatDateShort, txStatusColor, txStatusLabel, TX_TYPES } from '../../utils/helpers'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => { load() }, [page, statusFilter, typeFilter])

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getTransactions(page)
      setTransactions(res.data.transactions || [])
      setTotalPages(res.data.pages || 1)
      setTotal(res.data.total || 0)
    } catch {}
    finally { setLoading(false) }
  }

  const filtered = transactions
    .filter((tx) => !search || tx.user?.name?.toLowerCase().includes(search.toLowerCase()) || tx.user?.phone?.includes(search) || tx.reference?.toLowerCase().includes(search.toLowerCase()))
    .filter((tx) => !statusFilter || tx.status === statusFilter)
    .filter((tx) => !typeFilter || tx.type === typeFilter)

  const totalRevenue = transactions.filter((tx) => tx.status === 'success' && ['data','airtime','electricity','tv','result_checker'].includes(tx.type)).reduce((s, tx) => s + tx.amount, 0)

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div><h2 className="font-display text-2xl font-bold">Transactions</h2><p className="text-slate-400 text-sm">{total.toLocaleString()} total — Revenue this page: <span className="text-emerald-400 font-semibold">{formatNaira(totalRevenue)}</span></p></div>
        <button onClick={load} className="btn-ghost gap-2 text-sm"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search name, phone, reference..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 w-full" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="input-field w-36">
          <option value="">All Status</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="input-field w-40">
          <option value="">All Types</option>
          <option value="data">Data</option>
          <option value="airtime">Airtime</option>
          <option value="electricity">Electricity</option>
          <option value="tv">TV</option>
          <option value="wallet_fund">Wallet Fund</option>
          <option value="result_checker">Result Checker</option>
        </select>
        {(statusFilter || typeFilter) && <button onClick={() => { setStatusFilter(''); setTypeFilter(''); setPage(1) }} className="btn-ghost text-xs gap-1"><X size={12} /> Clear</button>}
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Loading transactions...</div> : filtered.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">No transactions found.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Receipt</th>
              </tr></thead>
              <tbody>
                {filtered.map((tx) => {
                  const t = TX_TYPES[tx.type] || { icon: '📦', label: tx.type }
                  return (
                    <tr key={tx._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-brand-blue/15 flex items-center justify-center text-xs font-bold text-brand-blue flex-shrink-0">{tx.user?.name?.[0]?.toUpperCase() || '?'}</div>
                          <div><p className="text-white text-xs font-medium">{tx.user?.name || 'Unknown'}</p><p className="text-xs text-slate-500">{tx.user?.phone}</p></div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{t.icon} {t.label}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs max-w-32 truncate">{tx.description || '-'}</td>
                      <td className="px-4 py-3 font-bold text-white">{formatNaira(tx.amount)}</td>
                      <td className="px-4 py-3"><span className={'text-xs px-2 py-0.5 rounded-md font-medium ' + txStatusColor(tx.status)}>{txStatusLabel(tx.status)}</span></td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{formatDateShort(tx.createdAt)}</td>
                      <td className="px-4 py-3"><button onClick={() => setSelected(tx)} className="text-xs text-brand-blue hover:text-brand-cyan transition-colors">View</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]">
            <button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1} className="btn-ghost text-xs disabled:opacity-40">Previous</button>
            <span className="text-xs text-slate-400">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn-ghost text-xs disabled:opacity-40">Next</button>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="glass-card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold">Full Receipt</h3>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="text-center mb-4 pb-4 border-b border-white/10">
              <p className="font-display font-bold text-base">AL-HUSSAIN <span className="text-brand-cyan">DATA</span></p>
              <p className="text-xs text-slate-400 mt-1">Admin Transaction Receipt</p>
            </div>
            <div className="space-y-3 mb-4">
              {[
                ['Customer', selected.user?.name || 'Unknown'],
                ['Phone', selected.user?.phone || '-'],
                ['Reference', selected.reference || selected._id],
                ['Type', (selected.type || '').replace(/_/g,' ')],
                ['Description', selected.description || '-'],
                ['Amount', formatNaira(selected.amount)],
                ['Status', selected.status],
                ['Date', new Date(selected.createdAt).toLocaleString('en-NG', {dateStyle:'medium',timeStyle:'short'})],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white font-medium text-right max-w-52 break-all">{v}</span>
                </div>
              ))}
            </div>
            {selected.providerResponse?.pins && (
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Pins Delivered</p>
                {selected.providerResponse.pins.map((p, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 mb-1">
                    <p className="font-mono text-sm text-white font-bold">{p.pin}</p>
                    <p className="text-xs text-slate-500">Serial: {p.serial}</p>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => window.print()} className="btn-ghost w-full justify-center mt-4 text-sm">🖨️ Print Receipt</button>
          </div>
        </div>
      )}
    </div>
  )
}