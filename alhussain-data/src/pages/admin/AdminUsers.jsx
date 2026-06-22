import { useState, useEffect } from 'react'
import { Search, Plus, X, MoreVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI } from '../../utils/api'
import { formatNaira, formatDateShort } from '../../utils/helpers'

const DEMO_USERS = [
  { _id: '1', name: 'Ahmad Musa', phone: '08012345678', email: 'ahmad@email.com', walletBalance: 4500, status: 'active', createdAt: new Date(Date.now() - 86400000 * 30).toISOString() },
  { _id: '2', name: 'Fatima Bello', phone: '08023456789', email: 'fatima@email.com', walletBalance: 12300, status: 'active', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() },
  { _id: '3', name: 'Ibrahim Sani', phone: '08034567890', email: '', walletBalance: 0, status: 'suspended', createdAt: new Date(Date.now() - 86400000 * 60).toISOString() },
  { _id: '4', name: 'Zainab Yusuf', phone: '08045678901', email: 'zainab@email.com', walletBalance: 28900, status: 'active', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { _id: '5', name: 'Usman Garba', phone: '08056789012', email: '', walletBalance: 1200, status: 'active', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
]

export default function AdminUsers() {
  const [users, setUsers] = useState(DEMO_USERS)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fundModal, setFundModal] = useState(null)
  const [fundAmount, setFundAmount] = useState('')
  const [funding, setFunding] = useState(false)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const res = await adminAPI.getUsers()
      setUsers(res.data.users || DEMO_USERS)
    } catch {
      setUsers(DEMO_USERS)
    } finally {
      setLoading(false)
    }
  }

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const handleFund = async () => {
    const amt = parseFloat(fundAmount)
    if (!amt || amt <= 0) return toast.error('Enter a valid amount')
    setFunding(true)
    try {
      await adminAPI.fundUser(fundModal._id, amt)
      setUsers((prev) => prev.map((u) => u._id === fundModal._id ? { ...u, walletBalance: u.walletBalance + amt } : u))
      toast.success(`${formatNaira(amt)} credited to ${fundModal.name}`)
      setFundModal(null)
      setFundAmount('')
    } catch (err) {
      // Demo fallback
      setUsers((prev) => prev.map((u) => u._id === fundModal._id ? { ...u, walletBalance: u.walletBalance + amt } : u))
      toast.success(`${formatNaira(amt)} credited (demo mode)`)
      setFundModal(null)
      setFundAmount('')
    } finally {
      setFunding(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Users</h2>
          <p className="text-slate-400 text-sm mt-0.5">{users.length} registered users</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input type="text" placeholder="Search by name, phone, or email…"
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Balance</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 bg-white/5 rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">No users found</td></tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u._id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {u.name[0]?.toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-300">
                      <p>{u.phone}</p>
                      {u.email && <p className="text-xs text-slate-500">{u.email}</p>}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-white">{formatNaira(u.walletBalance)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                        u.status === 'active' ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
                      }`}>
                        {u.status === 'active' ? '● Active' : '● Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{formatDateShort(u.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => setFundModal(u)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 transition-colors font-medium">
                        Fund wallet
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fund modal */}
      {fundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setFundModal(null)}>
          <div className="glass-card p-6 w-full max-w-sm bg-navy-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg">Fund Wallet</h3>
              <button onClick={() => setFundModal(null)} className="text-slate-500 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Crediting <span className="text-white font-medium">{fundModal.name}</span>'s wallet manually
            </p>
            <div className="mb-4">
              <label className="input-label">Amount (₦)</label>
              <input type="number" autoFocus placeholder="Enter amount"
                value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                className="input-field" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setFundModal(null)} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={handleFund} disabled={funding}
                className="btn-primary flex-1 justify-center disabled:opacity-60">
                {funding ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Credit wallet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
