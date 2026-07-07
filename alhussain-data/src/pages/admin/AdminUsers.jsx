import { useState, useEffect } from 'react'
import { Search, X, DollarSign, UserCheck, UserX, Eye, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI, updateUserStatus } from '../../utils/api'
import { formatNaira, formatDateShort } from '../../utils/helpers'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [fundModal, setFundModal] = useState(null)
  const [fundAmount, setFundAmount] = useState('')
  const [funding, setFunding] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userTx, setUserTx] = useState([])
  const [loadingUser, setLoadingUser] = useState(false)

  useEffect(() => { load() }, [page])

  const load = async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getUsers(page)
      setUsers(res.data.users)
      setTotalPages(res.data.pages)
    } catch { toast.error('Failed to load users.') }
    finally { setLoading(false) }
  }

  const viewUser = async (user) => {
    setSelectedUser(user); setLoadingUser(true)
    try {
      const res = await adminAPI.getUserById(user._id)
      setUserTx(res.data.transactions || [])
    } catch { toast.error('Failed to load user details.') }
    finally { setLoadingUser(false) }
  }

  const handleFund = async () => {
    const amt = parseFloat(fundAmount)
    if (!amt || amt <= 0) return toast.error('Enter a valid amount.')
    setFunding(true)
    try {
      const res = await adminAPI.fundUser(fundModal._id, amt)
      setUsers((prev) => prev.map((u) => u._id === fundModal._id ? { ...u, walletBalance: res.data.balance } : u))
      if (selectedUser?._id === fundModal._id) setSelectedUser((p) => ({ ...p, walletBalance: res.data.balance }))
      toast.success(formatNaira(amt) + ' credited to ' + fundModal.name)
      setFundModal(null); setFundAmount('')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to credit wallet. No money was moved.') }
    finally { setFunding(false) }
  }

  const handleStatus = async (user, status) => {
    try {
      await updateUserStatus(user._id, status)
      setUsers((prev) => prev.map((u) => u._id === user._id ? { ...u, status } : u))
      if (selectedUser?._id === user._id) setSelectedUser((p) => ({ ...p, status }))
      toast.success('User ' + (status === 'active' ? 'activated' : 'suspended') + '.')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update status.') }
  }

  const filtered = users.filter((u) =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search) || u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between">
        <div><h2 className="font-display text-2xl font-bold">Users</h2><p className="text-slate-400 text-sm">Manage customer accounts</p></div>
        <button onClick={load} className="btn-ghost gap-2 text-sm"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh</button>
      </div>
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" placeholder="Search name, phone or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 w-full" />
      </div>
      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Loading users...</div> : filtered.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">No users found.</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]"><th className="px-4 py-3 font-medium">User</th><th className="px-4 py-3 font-medium">Phone</th><th className="px-4 py-3 font-medium">Balance</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Joined</th><th className="px-4 py-3 font-medium">Actions</th></tr></thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-brand-blue/15 flex items-center justify-center text-xs font-bold text-brand-blue">{u.name?.[0]?.toUpperCase() || '?'}</div><div><p className="text-white font-medium text-sm">{u.name}</p><p className="text-xs text-slate-500">{u.email}</p></div></div></td>
                    <td className="px-4 py-3 text-slate-300 text-sm">{u.phone}</td>
                    <td className="px-4 py-3 font-medium text-emerald-400">{formatNaira(u.walletBalance || 0)}</td>
                    <td className="px-4 py-3"><span className={'text-xs px-2 py-0.5 rounded-full font-medium ' + (u.status === 'suspended' ? 'bg-red-400/10 text-red-400' : 'bg-emerald-400/10 text-emerald-400')}>{u.status || 'active'}</span></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{formatDateShort(u.createdAt)}</td>
                    <td className="px-4 py-3"><div className="flex items-center gap-1.5">
                      <button onClick={() => viewUser(u)} title="View" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-brand-blue/20 flex items-center justify-center text-slate-400 hover:text-brand-blue"><Eye size={13} /></button>
                      <button onClick={() => { setFundModal(u); setFundAmount('') }} title="Fund" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-emerald-400/20 flex items-center justify-center text-slate-400 hover:text-emerald-400"><DollarSign size={13} /></button>
                      {u.status !== 'suspended' ? <button onClick={() => handleStatus(u, 'suspended')} title="Suspend" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-red-400/20 flex items-center justify-center text-slate-400 hover:text-red-400"><UserX size={13} /></button> : <button onClick={() => handleStatus(u, 'active')} title="Activate" className="w-7 h-7 rounded-lg bg-white/5 hover:bg-emerald-400/20 flex items-center justify-center text-slate-400 hover:text-emerald-400"><UserCheck size={13} /></button>}
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {totalPages > 1 && <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06]"><button onClick={() => setPage((p) => Math.max(1,p-1))} disabled={page===1} className="btn-ghost text-xs disabled:opacity-40">Previous</button><span className="text-xs text-slate-400">Page {page} of {totalPages}</span><button onClick={() => setPage((p) => Math.min(totalPages,p+1))} disabled={page===totalPages} className="btn-ghost text-xs disabled:opacity-40">Next</button></div>}
      </div>

      {fundModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setFundModal(null)}>
          <div className="glass-card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="font-display font-semibold text-lg">Fund Wallet</h3><button onClick={() => setFundModal(null)} className="text-slate-500 hover:text-white"><X size={18} /></button></div>
            <p className="text-sm text-slate-400 mb-1">Crediting <span className="text-white font-medium">{fundModal.name}</span></p>
            <p className="text-xs text-slate-500 mb-4">Current balance: <span className="text-emerald-400 font-medium">{formatNaira(fundModal.walletBalance || 0)}</span></p>
            <div className="mb-4"><label className="input-label">Amount (₦)</label><input type="number" autoFocus placeholder="Enter amount" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)} className="input-field" /></div>
            <div className="flex gap-2">
              <button onClick={() => setFundModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={handleFund} disabled={funding || !fundAmount} className="btn-primary flex-1 justify-center disabled:opacity-60">{funding ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Credit Wallet'}</button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
          <div className="glass-card p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5"><h3 className="font-display font-semibold text-lg">User Details</h3><button onClick={() => setSelectedUser(null)} className="text-slate-500 hover:text-white"><X size={18} /></button></div>
            <div className="flex items-center gap-4 mb-5 p-4 bg-white/5 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-brand-blue/20 flex items-center justify-center text-xl font-bold text-brand-blue">{selectedUser.name?.[0]?.toUpperCase()}</div>
              <div className="flex-1"><p className="font-semibold text-white">{selectedUser.name}</p><p className="text-sm text-slate-400">{selectedUser.phone}</p><p className="text-xs text-slate-500">{selectedUser.email}</p></div>
              <div className="text-right"><p className="text-xs text-slate-400">Balance</p><p className="font-display font-bold text-emerald-400 text-lg">{formatNaira(selectedUser.walletBalance || 0)}</p></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button onClick={() => { setFundModal(selectedUser); setFundAmount(''); setSelectedUser(null) }} className="btn-primary justify-center gap-2 text-sm"><DollarSign size={14} /> Fund Wallet</button>
              {selectedUser.status !== 'suspended' ? <button onClick={() => handleStatus(selectedUser, 'suspended')} className="btn-ghost justify-center gap-2 text-sm text-red-400"><UserX size={14} /> Suspend</button> : <button onClick={() => handleStatus(selectedUser, 'active')} className="btn-ghost justify-center gap-2 text-sm text-emerald-400"><UserCheck size={14} /> Activate</button>}
            </div>
            <h4 className="text-xs text-slate-400 uppercase tracking-wider mb-3">Recent Transactions</h4>
            {loadingUser ? <div className="text-center py-4 text-slate-400 text-sm">Loading...</div> : userTx.length === 0 ? <div className="text-center py-4 text-slate-400 text-sm">No transactions yet.</div> : (
              <div className="space-y-2">
                {userTx.map((tx) => (
                  <div key={tx._id} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                    <div><p className="text-sm text-white">{tx.description || tx.type}</p><p className="text-xs text-slate-500">{formatDateShort(tx.createdAt)}</p></div>
                    <div className="text-right"><p className="text-sm font-medium text-white">{formatNaira(tx.amount)}</p><span className={'text-xs px-1.5 py-0.5 rounded font-medium ' + (tx.status === 'success' ? 'bg-emerald-400/10 text-emerald-400' : tx.status === 'failed' ? 'bg-red-400/10 text-red-400' : 'bg-yellow-400/10 text-yellow-400')}>{tx.status}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}