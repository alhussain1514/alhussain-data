import { useState, useEffect } from 'react'
import { RefreshCw, Edit2, Check, X } from 'lucide-react'
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
    } catch { toast.error('Failed to load pricing.') }
    finally { setLoading(false) }
  }

  const saveEdit = async (plan) => {
    const newPrice = parseFloat(editValue)
    if (!newPrice || newPrice <= 0) return toast.error('Enter a valid price.')
    setSaving(true)
    try {
      const updatedPlans = plans.map((p) => p.id === plan.id ? { ...p, sellingPrice: newPrice, price: newPrice } : p)
      const dataPlans = updatedPlans.map((p) => ({
        id: p.id, name: p.name, duration: p.duration, network: p.network,
        costPrice: p.costPrice || 0, sellingPrice: p.sellingPrice || p.price,
        providerPlanId: String(p.providerPlanId), active: true,
      }))
      await adminAPI.updatePricing({ dataPlans })
      setPlans(updatedPlans)
      setEditingId(null)
      toast.success('Price updated!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save.') }
    finally { setSaving(false) }
  }

  const networkPlans = plans.filter((p) => p.network === activeNetwork)

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div><h2 className="font-display text-2xl font-bold">Pricing Editor</h2><p className="text-slate-400 text-sm">Update selling prices for all plans</p></div>
        <button onClick={load} className="btn-ghost gap-2 text-sm"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Reload</button>
      </div>
      <div className="flex gap-2 flex-wrap">
        {NETWORKS.map((net) => (<button key={net} onClick={() => setActiveNetwork(net)} className={'px-4 py-2 rounded-xl text-sm font-medium transition-all ' + (activeNetwork === net ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30' : 'glass-card text-slate-400 hover:text-white')}>{net}</button>))}
      </div>
      <div className="glass-card overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-400 text-sm">Loading plans...</div> : networkPlans.length === 0 ? <div className="p-8 text-center text-slate-400 text-sm">No active plans for {activeNetwork}.</div> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]"><th className="px-5 py-3 font-medium">Plan</th><th className="px-5 py-3 font-medium">Duration</th><th className="px-5 py-3 font-medium">Provider ID</th><th className="px-5 py-3 font-medium">Selling Price</th><th className="px-5 py-3 font-medium">Edit</th></tr></thead>
            <tbody>
              {networkPlans.map((plan) => (
                <tr key={plan.id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-medium text-white">{plan.name}</td>
                  <td className="px-5 py-3 text-slate-400">{plan.duration}</td>
                  <td className="px-5 py-3 text-slate-500 font-mono text-xs">{plan.providerPlanId}</td>
                  <td className="px-5 py-3">
                    {editingId === plan.id ? (
                      <div className="flex items-center gap-2"><span className="text-slate-400 text-xs">₦</span><input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-24 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-white text-sm focus:outline-none focus:border-brand-blue" /></div>
                    ) : (
                      <span className="font-display font-bold text-emerald-400">{formatNaira(plan.sellingPrice || plan.price)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {editingId === plan.id ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => saveEdit(plan)} disabled={saving} className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/30"><Check size={13} /></button>
                        <button onClick={() => setEditingId(null)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><X size={13} /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(plan.id); setEditValue(String(plan.sellingPrice || plan.price)) }} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-brand-blue/20 flex items-center justify-center text-slate-400 hover:text-brand-blue"><Edit2 size={13} /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-1">Result Checker Prices</h3>
        <p className="text-xs text-slate-400 mb-4">Fixed in backend. Edit PIN_PRICES in vtu.controller.js to change.</p>
        <div className="grid grid-cols-3 gap-3">
          {[{label:'WAEC',price:3600},{label:'NECO',price:1500},{label:'NABTEB',price:1200}].map((e) => (
            <div key={e.label} className="bg-white/5 rounded-xl p-4 text-center"><p className="text-sm font-semibold text-white">{e.label}</p><p className="font-display font-bold text-emerald-400 mt-1">{formatNaira(e.price)}</p></div>
          ))}
        </div>
      </div>
    </div>
  )
}