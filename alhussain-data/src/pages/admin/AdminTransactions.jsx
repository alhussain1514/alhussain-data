import { useState, useEffect } from 'react'
import { Search, RefreshCw, X } from 'lucide-react'
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
      const res = await adminAPI.getTransactions(page, {
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: search || undefined,
      })
      setTransactions(res.data.transactions || [])
      setTotalPages(res.data.pages || 1)
      setTotal(res.data.total || 0)
    } catch {}
    finally { setLoading(false) }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    load()
  }

  const filtered = transactions

  const totalRevenue = transactions.filter((tx) => tx.status === 'success' && ['data','airtime','electricity','tv','result_checker'].includes(tx.type)).reduce((s, tx) => s + tx.amount, 0)

  const exportCSV = () => {
    const header = ['Date', 'Customer', 'Phone', 'Type', 'Description', 'Amount', 'Status', 'Reference']
    const rows = transactions.map((tx) => [
      new Date(tx.createdAt).toISOString(), tx.user?.name || '', tx.user?.phone || '', tx.type,
      (tx.description || '').replace(/,/g, ';'), tx.amount, tx.status, tx.reference,
    ])
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-page${page}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Transactions</h2>
          <p className="text-slate-400 text-sm">{total.toLocaleString()} total · Page revenue: {formatNaira(totalRevenue)}</p>
        </div>
        <button onClick={load} className="btn-ghost gap-2 text-sm"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button>
        <button onClick={exportCSV} className="btn-ghost gap-2 text-sm ml-2">⬇ Export CSV</button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input type="text" placeholder="Search reference or description, press Enter..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 w-full" />
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="input-field">
          <option value="">All Statuses</option>
          <option value="success">Success</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }} className="input-field">
          <option value="">All Types</option>
          <option value="data">Data</option>
          <option value="airtime">Airtime</option>
          <option value="electricity">Electricity</option>
          <option value="tv">TV</option>
          <option value="result_checker">Result Checker</option>
          <option value="wallet_fund">Wallet Funding</option>
        </select>
        {(statusFilter || typeFilter) && <button type="button" onClick={() => { setStatusFilter(''); setTypeFilter(''); setSearch(''); setPage(1) }} className="btn-ghost text-xs gap-1"><X size={12} /> Clear</button>}
      </form>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Description</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => {
                  const t = TX_TYPES[tx.type] || { icon: '📦', label: tx.type }
                  return (
                    <tr key={tx._id} onClick={() => setSelected(tx)} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] cursor-pointer">
                      <td className="px-5 py-3">
                        <p className="text-white font-medium">{tx.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-slate-500">{tx.user?.phone}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-300 text-xs">{t.icon} {t.label}</td>
                      <td className="px-5 py-3 text-slate-400 text-xs max-w-48 truncate">{tx.description}</td>
                      <td className="px-5 py-3 font-medium text-white">{formatNaira(tx.amount)}</td>
                      <td className="px-5 py-3"><span className={'text-xs px-2 py-0.5 rounded-md font-medium ' + txStatusColor(tx.status)}>{txStatusLabel(tx.status)}</span></td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{formatDateShort(tx.createdAt)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-40">Prev</button>
          <span className="text-sm text-slate-400 px-3">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost text-sm disabled:opacity-40">Next</button>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" onClick={() => setSelected(null)}>
          <div className="glass-card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg">Transaction Detail</h3>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-3 mb-4">
              {[
                ['Reference', selected.reference],
                ['Customer', selected.user?.name],
                ['Phone', selected.user?.phone],
                ['Type', TX_TYPES[selected.type]?.label || selected.type],
                ['Description', selected.description],
                ['Amount', formatNaira(selected.amount)],
                ['Balance Before', formatNaira(selected.balanceBefore)],
                ['Balance After', formatNaira(selected.balanceAfter)],
                ['Status', txStatusLabel(selected.status)],
                ['Date', new Date(selected.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-white font-medium text-right max-w-56 truncate">{v}</span>
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
            {selected.providerResponse && !selected.providerResponse?.pins && (
              <div className="pt-3 border-t border-white/10">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Demboss Response {selected.status === 'failed' ? '(why it failed)' : ''}</p>
                <pre className="bg-white/5 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap break-words">{JSON.stringify(selected.providerResponse, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
