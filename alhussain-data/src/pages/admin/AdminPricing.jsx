import { useState, useEffect } from 'react'
import { RefreshCw, Edit2, Check, X, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminAPI, vtuAPI } from '../../utils/api'
import { formatNaira } from '../../utils/helpers'

const NETWORKS = ['MTN', 'GLO', 'AIRTEL', '9MOBILE']
const TV_PROVIDERS = ['dstv', 'gotv', 'startimes', 'showmax']

export default function AdminPricing() {
  const [tab, setTab] = useState('data')
  const [dataPlans, setDataPlans] = useState([])
  const [tvPlans, setTvPlans] = useState([])
  const [examPrices, setExamPrices] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [activeNetwork, setActiveNetwork] = useState('MTN')
  const [activeTvProvider, setActiveTvProvider] = useState('dstv')
  const [pendingChanges, setPendingChanges] = useState({})

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    try {
      const allDataPlans = []
      for (const net of NETWORKS) {
        try {
          const r = await vtuAPI.getDataPlans(net)
          allDataPlans.push(...(r.data.plans || []).map((p) => ({ ...p, network: net })))
        } catch {}
      }
      setDataPlans(allDataPlans)

      const allTvPlans = []
      for (const prov of TV_PROVIDERS) {
        try {
          const r = await vtuAPI.getTvPlans(prov)
          allTvPlans.push(...(r.data.plans || []).map((p) => ({ ...p, provider: prov })))
        } catch {}
      }
      setTvPlans(allTvPlans)

      try {
        const r = await vtuAPI.getExamPinPrices()
        setExamPrices(r.data.prices || [])
      } catch {}

      setPendingChanges({})
    } catch { toast.error('Failed to load pricing.') }
    finally { setLoading(false) }
  }

  const startEdit = (key, currentValue) => {
    setEditingId(key)
    setEditValue(String(pendingChanges[key] ?? currentValue ?? ''))
  }

  const applyEdit = (key) => {
    const val = parseFloat(editValue)
    if (!val || val <= 0) return toast.error('Enter a valid price.')
    setPendingChanges((prev) => ({ ...prev, [key]: val }))
    setEditingId(null)
    toast.success('Price staged. Click Save All Changes to apply.')
  }

  const hasPending = Object.keys(pendingChanges).length > 0

  const saveAll = async () => {
    if (!hasPending) return toast.error('No changes to save.')
    setSaving(true)
    try {
      const updatedDataPlans = dataPlans.map((p) => ({
        id: p.id, name: p.name, duration: p.duration, network: p.network,
        costPrice: p.costPrice || 0,
        sellingPrice: pendingChanges[`data-${p.id}`] ?? p.sellingPrice ?? p.price,
        providerPlanId: String(p.providerPlanId), planType: p.planType, active: true,
      }))
      const updatedTvPlans = tvPlans.map((p) => ({
        id: p.id, name: p.name, provider: p.provider,
        costPrice: p.costPrice || 0,
        sellingPrice: pendingChanges[`tv-${p.id}`] ?? p.sellingPrice ?? p.price,
        providerPlanId: String(p.providerPlanId), active: true,
      }))
      const updatedExamPrices = examPrices.map((p) => ({
        examName: p.examName,
        sellingPrice: pendingChanges[`exam-${p.examName}`] ?? p.sellingPrice,
      }))

      await adminAPI.updatePricing({ dataPlans: updatedDataPlans, tvPlans: updatedTvPlans, examPinPrices: updatedExamPrices })

      setDataPlans((prev) => prev.map((p) => pendingChanges[`data-${p.id}`] ? { ...p, sellingPrice: pendingChanges[`data-${p.id}`], price: pendingChanges[`data-${p.id}`] } : p))
      setTvPlans((prev) => prev.map((p) => pendingChanges[`tv-${p.id}`] ? { ...p, sellingPrice: pendingChanges[`tv-${p.id}`], price: pendingChanges[`tv-${p.id}`] } : p))
      setExamPrices((prev) => prev.map((p) => pendingChanges[`exam-${p.examName}`] ? { ...p, sellingPrice: pendingChanges[`exam-${p.examName}`] } : p))

      setPendingChanges({})
      toast.success('All prices saved successfully!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save prices.') }
    finally { setSaving(false) }
  }

  const networkPlans = dataPlans.filter((p) => p.network === activeNetwork)
  const providerPlans = tvPlans.filter((p) => p.provider === activeTvProvider)

  const margin = (cost, sell) => {
    const c = Number(cost) || 0, s = Number(sell) || 0
    if (!c) return null
    const pct = (((s - c) / c) * 100).toFixed(1)
    return { amount: s - c, pct }
  }

  const priceCell = (key, currentSell, currentCost) => {
    const isPending = pendingChanges[key] !== undefined
    const m = margin(currentCost, isPending ? pendingChanges[key] : currentSell)
    return (
      <>
        <td className="px-5 py-3">
          <span className={'font-display font-bold ' + (isPending ? 'text-slate-500 line-through text-xs' : 'text-emerald-400')}>
            {formatNaira(currentSell)}
          </span>
          {m && !isPending && <p className="text-xs text-slate-500 mt-0.5">+{formatNaira(m.amount)} ({m.pct}%) margin</p>}
        </td>
        <td className="px-5 py-3">
          {editingId === key ? (
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-xs">₦</span>
              <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)}
                className="w-24 bg-white/10 border border-brand-blue/40 rounded-lg px-2 py-1 text-white text-sm font-bold focus:outline-none focus:border-brand-blue"
                autoFocus />
            </div>
          ) : isPending ? (
            <span className="font-display font-bold text-yellow-400">{formatNaira(pendingChanges[key])} <span className="text-xs font-normal">(pending)</span></span>
          ) : (
            <span className="text-slate-600 text-xs">—</span>
          )}
        </td>
        <td className="px-5 py-3">
          {editingId === key ? (
            <div className="flex items-center gap-1.5">
              <button onClick={() => applyEdit(key)} className="w-7 h-7 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/30"><Check size={13} /></button>
              <button onClick={() => setEditingId(null)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white"><X size={13} /></button>
            </div>
          ) : (
            <button onClick={() => startEdit(key, currentSell)} className="w-7 h-7 rounded-lg bg-white/5 hover:bg-brand-blue/20 flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors"><Edit2 size={13} /></button>
          )}
        </td>
      </>
    )
  }

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

      <div className="flex gap-2">
        {[['data', 'Data'], ['tv', 'Cable TV'], ['exam', 'Exam Pins']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={'px-4 py-2 rounded-xl text-sm font-semibold transition-all ' + (tab === id ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30' : 'glass-card text-slate-400 hover:text-white')}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'data' && (
        <>
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
              <div className="p-8 text-center text-slate-400 text-sm">No active plans for {activeNetwork}. Run `npm run seed-plans` on the backend first.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Duration</th>
                    <th className="px-5 py-3 font-medium">Demboss pId</th>
                    <th className="px-5 py-3 font-medium">Current Price</th>
                    <th className="px-5 py-3 font-medium">New Price</th>
                    <th className="px-5 py-3 font-medium">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {networkPlans.map((plan) => (
                    <tr key={plan.id} className={'border-b border-white/[0.04] last:border-0 ' + (pendingChanges[`data-${plan.id}`] ? 'bg-yellow-400/5' : 'hover:bg-white/[0.02]')}>
                      <td className="px-5 py-3 font-semibold text-white">{plan.name}</td>
                      <td className="px-5 py-3 text-slate-400">{plan.duration}</td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-xs">{plan.providerPlanId}</td>
                      {priceCell(`data-${plan.id}`, plan.sellingPrice || plan.price, plan.costPrice)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'tv' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {TV_PROVIDERS.map((prov) => (
              <button key={prov} onClick={() => setActiveTvProvider(prov)}
                className={'px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ' + (activeTvProvider === prov ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/30' : 'glass-card text-slate-400 hover:text-white')}>
                {prov}
              </button>
            ))}
          </div>
          <div className="glass-card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-sm">Loading plans...</div>
            ) : providerPlans.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">No active plans for {activeTvProvider}.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-5 py-3 font-medium">Plan</th>
                    <th className="px-5 py-3 font-medium">Demboss cpId</th>
                    <th className="px-5 py-3 font-medium">Current Price</th>
                    <th className="px-5 py-3 font-medium">New Price</th>
                    <th className="px-5 py-3 font-medium">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {providerPlans.map((plan) => (
                    <tr key={plan.id} className={'border-b border-white/[0.04] last:border-0 ' + (pendingChanges[`tv-${plan.id}`] ? 'bg-yellow-400/5' : 'hover:bg-white/[0.02]')}>
                      <td className="px-5 py-3 font-semibold text-white">{plan.name}</td>
                      <td className="px-5 py-3 text-slate-500 font-mono text-xs">{plan.providerPlanId}</td>
                      {priceCell(`tv-${plan.id}`, plan.sellingPrice || plan.price, plan.costPrice)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'exam' && (
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading prices...</div>
          ) : examPrices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No exam pin prices configured.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider border-b border-white/[0.06] bg-white/[0.02]">
                  <th className="px-5 py-3 font-medium">Exam</th>
                  <th className="px-5 py-3 font-medium">Current Price</th>
                  <th className="px-5 py-3 font-medium">New Price</th>
                  <th className="px-5 py-3 font-medium">Edit</th>
                </tr>
              </thead>
              <tbody>
                {examPrices.map((p) => (
                  <tr key={p.examName} className={'border-b border-white/[0.04] last:border-0 ' + (pendingChanges[`exam-${p.examName}`] ? 'bg-yellow-400/5' : 'hover:bg-white/[0.02]')}>
                    <td className="px-5 py-3 font-semibold text-white">{p.examName}</td>
                    {priceCell(`exam-${p.examName}`, p.sellingPrice, null)}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="p-4 border-t border-white/[0.06] text-xs text-slate-400">
            ⚠️ JAMB, WAEC Registration, and NBAIS prices were seeded as placeholders — confirm the real Demboss prices for these and update them here before enabling those purchases.
          </div>
        </div>
      )}

      <div className="glass-card p-5 border border-blue-500/10">
        <h3 className="font-display font-semibold mb-2">How Pricing Works</h3>
        <div className="space-y-2 text-xs text-slate-400">
          <p>• Click the <span className="text-white">pencil icon</span> next to any plan to edit its selling price</p>
          <p>• Changes are staged (shown in yellow) until you click <span className="text-yellow-400 font-semibold">Save All Changes</span></p>
          <p>• Once saved, the new price is live instantly — all customers see it immediately</p>
          <p>• The small line under each price shows your margin over Demboss's cost price</p>
          <p>• Revenue = only successful transactions (data, airtime, electricity, TV, result checker)</p>
          <p>• Wallet funding transactions are NOT counted as revenue</p>
        </div>
      </div>
    </div>
  )
}
