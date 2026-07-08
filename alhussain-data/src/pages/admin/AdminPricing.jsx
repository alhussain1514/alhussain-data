import { useState, useEffect } from 'react'
import { RefreshCw, Edit2, Check, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI, vtuAPI } from '../../utils/api'
import { formatNaira } from '../../utils/helpers'

const NETWORKS = ['MTN', 'GLO', 'AIRTEL', '9MOBILE']

export default function AdminPricing() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [activeNetwork, setActiveNetwork] = useState('MTN')
  const [pendingChanges, setPendingChanges] = useState({})

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const allPlans = []
      for (const net of NETWORKS) {
        try {
          const r = await vtuAPI.getDataPlans(net)
          allPlans.push(...(r.data.plans || []).map((p) => ({ ...p, network: net })))
        } catch {}
      }
      setPlans(allPlans)
      setPendingChanges({})
    } catch { toast.error('Failed to load pricing.') }
    finally { setLoading(false) }
  }

  const startEdit = (plan) => {
    setEditingId(plan.id)
    setEditValue(String(pendingChanges[plan.id] || plan.sellingPrice || plan.price || ''))
  }

  const applyEdit = (plan) => {
    const val = parseFloat(editValue)
    if (!val || val <= 0) return toast.error('Enter a valid price.')
    setPendingChanges((prev) => ({ ...prev, [plan.id]: val }))
    setEditingId(null)
    toast.success('Price staged. Click Save All Changes to apply.')
  }

  const saveAll = async () => {
    if (Object.keys(pendingChanges).length === 0) return toast.error('No changes to save.')
    setSaving(true)
    try {
      const updatedPlans = plans.map((p) => ({
        id: p.id, name: p.name, duration: p.duration, network: p.network,
        costPrice: p.costPrice || 0,
        sellingPrice: pendingChanges[p.id] || p.sellingPrice || p.price,
        providerPlanId: String(p.providerPlanId), active: true,
      }))
      await adminAPI.updatePricing({ dataPlans: updatedPlans })
      setPlans((prev) => prev.map((p) => pendingChanges[p.id] ? { ...p, sellingPrice: pendingChanges[p.id], price: pendingChanges[p.id] } : p))
      setPendingChanges({})
      toast.success('All prices saved successfully!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save prices.') }
    finally { setSaving(false) }
  }

  const networkPlans = plans.filter((p) => p.network === activeNetwork)
  const hasPending = Object.keys(pendingChanges).length > 0

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Pricing Editor</h2>
          <p className="text-slate-400 text-sm">Update selling prices — changes apply to all customers instantly</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="btn-ghost gap-2 text-sm"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Reload</button>
          {hasPending && (
            <button onClick={saveAll} disabled={saving} className="btn-primary gap-2 text-sm disabled:opacity-60">
              {saving ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save size={15} /> Save All Changes ({Object.keys(pendingChanges).length})</>}
            </button>
          )}
        </div>
      </div>

      {hasPending && (
        <div className="glass-card p-4 border border-yellow-400/20 bg-yellow-400/5">
          <p className="text-yellow-400 text-sm font-medium">⚠️ You have {Object.keys(pendingChanges).length} unsaved price change{Object.keys(pendingChanges).length > 1 ? 's' : ''}. Click "Save All Changes" to apply them.</p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {NETWORKS.map((net) => (
          <button key={net} onClick={() => setActiveNetwork(net)}
            className={'px-4 py-2 rounded-xl text-sm font-semibold transition-all ' + (activeNetwork === net ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30' : 'glass-card text-slate-400 hover:text-white')}>
            {net}
          </button>
        ))}
      </div>

      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading plans...</div>
        ) : networkPlans.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No active plans for {activeNetwork}. Add plans via the terminal first.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]">
                <th className="px-5 py-3 font-medium">Plan</th>
                <th className="px-5 py-3 font-medium">Duration</th>
                <th className="px-5 py-3 font-medium">Provider ID</th>
                <th className="px-5 py-3 font-medium">Current Price</th>
                <th className="px-5 py-3 font-medium">New Price</th>
                <th className="px-5 py-3 font-medium">Edit</th>
              </tr>
            </thead>
            <tbody>
              {networkPlans.map((plan) => {
                const isPending = !!pendingChanges[plan.id]
                return (
                  <tr key={plan.id} className={'border-b border-white/[0.04] last:border-0 ' + (isPending ? 'bg-yellow-400/5' : 'hover:bg-white/[0.02]')}>
                    <td className="px-5 py-3 font-semibold text-white">{plan.name}</td>
                    <td className="px-5 py-3 text-slate-400">{plan.duration}</td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{plan.providerPlanId}</td>
                    <td className="px-5 py-3">
                      <span className={'font-display font-bold ' + (isPending ? 'text-slate-500 line-through text-xs' : 'text-emerald-400')}>
                        {formatNaira(plan.sellingPrice || plan.price)}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {editingId === plan.id ? (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 text-xs">₦</span>
                          <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                            className="w-24 bg-white/10 border border-brand-blue/40 rounded-lg px-2 py-1 text-white text-sm font-bold focus:outline-none focus:border-brand-blue"
                            autoFocus />
                        </div>
                      ) : isPending ? (
                        <span className="font-display font-bold text-yellow-400">{formatNaira(pendingChanges[plan.id])} <span className="text-xs font-normal">(pending)</span></span>
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {editingId === plan.id ? (
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => applyEdit(plan)} className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/30"><Check size={13} /></button>
                          <button onClick={() => setEditingId(null)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><X size={13} /></button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(plan)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-brand-blue/20 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors"><Edit2 size={13} /></button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-1">Result Checker Prices</h3>
        <p className="text-xs text-slate-400 mb-4">Hardcoded in backend. To change: edit PIN_PRICES in src/controllers/vtu.controller.js and redeploy.</p>
        <div className="grid grid-cols-3 gap-3">
          {[{label:'WAEC',price:3600},{label:'NECO',price:1500},{label:'NABTEB',price:1200}].map((e) => (
            <div key={e.label} className="bg-white/5 rounded-xl p-4 text-center border border-white/[0.06]">
              <p className="text-sm font-semibold text-white">{e.label}</p>
              <p className="font-display font-bold text-emerald-400 text-lg mt-1">{formatNaira(e.price)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5 border border-blue-500/10">
        <h3 className="font-display font-semibold mb-2">How Pricing Works</h3>
        <div className="space-y-2 text-xs text-slate-400">
          <p>• Click the <span className="text-white">pencil icon</span> next to any plan to edit its selling price</p>
          <p>• Changes are staged (shown in yellow) until you click <span className="text-yellow-400 font-semibold">Save All Changes</span></p>
          <p>• Once saved, the new price is live instantly — all customers see it immediately</p>
          <p>• Revenue = only successful transactions (data, airtime, electricity, TV, result checker)</p>
          <p>• Wallet funding transactions are NOT counted as revenue</p>
        </div>
      </div>
    </div>
  )
}