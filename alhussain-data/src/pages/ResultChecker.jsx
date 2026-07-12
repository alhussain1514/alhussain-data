import { useState, useEffect } from 'react'
import { GraduationCap, Minus, Plus, Download, Copy, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { vtuAPI } from '../utils/api'
import { formatNaira } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

const EXAM_LABELS = {
  WAECREGISTRATION: 'WAEC Reg.',
  NBAIS: 'NBAIS',
}

export default function ResultChecker() {
  const { user, updateUser } = useAuth()
  const [exams, setExams] = useState([])
  const [loadingExams, setLoadingExams] = useState(true)
  const [selectedExam, setSelectedExam] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [copiedIdx, setCopiedIdx] = useState(null)

  useEffect(() => {
    (async () => {
      setLoadingExams(true)
      try {
        const res = await vtuAPI.getExamPinPrices()
        const list = res.data.prices || []
        setExams(list)
        setSelectedExam(list[0] || null)
      } catch {
        setExams([])
      } finally {
        setLoadingExams(false)
      }
    })()
  }, [])

  const totalAmount = selectedExam ? selectedExam.sellingPrice * quantity : 0

  const handleBuy = async () => {
    if (!selectedExam) return
    if ((user?.walletBalance || 0) < totalAmount) {
      return toast.error('Insufficient wallet balance. Please fund your wallet.')
    }
    setLoading(true)
    try {
      const res = await vtuAPI.buyResultChecker({ examName: selectedExam.examName, quantity })
      setSuccess(res.data)
      updateUser({ walletBalance: (user?.walletBalance || 0) - totalAmount })
      toast.success('Pin(s) purchased successfully!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyPin = (pin, idx) => {
    navigator.clipboard.writeText(pin)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  if (success) {
    const reference = success.reference || 'AHD-' + Date.now()
    const dateStr = new Date().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
    const pins = success.pins || []

    return (
      <div className="max-w-md mx-auto py-8">
        <div className="text-center mb-6 no-print">
          <div className="w-20 h-20 rounded-full bg-emerald-400/10 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✅</span>
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Pin{quantity > 1 ? 's' : ''} Purchased!</h2>
          <p className="text-slate-400">{selectedExam.examName} Result Checker x{quantity}</p>
        </div>

        <div id="receipt-print-area" className="glass-card p-6 text-left mb-6">
          <div className="text-center mb-5 pb-4 border-b border-white/10">
            <p className="font-display font-bold text-lg">AL-HUSSAIN <span className="text-brand-cyan">DATA</span></p>
            <p className="text-xs text-slate-400 mt-1">Payment Receipt</p>
          </div>
          <div className="space-y-3 mb-4">
            {[
              ['Status', '✓ Successful'],
              ['Reference', reference],
              ['Date', dateStr],
              ['Exam', selectedExam.examName],
              ['Quantity', quantity],
              ['Amount Paid', formatNaira(totalAmount)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-slate-400">{k}</span>
                <span className="text-white font-medium">{v}</span>
              </div>
            ))}
          </div>

          {pins.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-white/10">
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Your Pin{pins.length > 1 ? 's' : ''}</p>
              {pins.map((p, i) => (
                <div key={i} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm text-white">{p.pin}</p>
                    {p.serial && <p className="text-xs text-slate-500">Serial: {p.serial}</p>}
                  </div>
                  <button onClick={() => copyPin(p.pin, i)} className="no-print text-slate-400 hover:text-white p-1">
                    {copiedIdx === i ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 no-print">
          <button onClick={() => window.print()} className="btn-ghost flex-1 justify-center gap-2">
            <Download size={16} /> Download Receipt
          </button>
          <button onClick={() => { setSuccess(null); setQuantity(1) }} className="btn-primary flex-1 justify-center">
            Buy more
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight mb-1">Result Checker</h2>
        <p className="text-slate-400 text-sm">WAEC, NECO, JAMB, and NABTEB result checker pins</p>
      </div>

      <div className="glass-card p-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">Wallet Balance</span>
        <span className="font-display font-bold text-white">{formatNaira(user?.walletBalance || 0)}</span>
      </div>

      <div>
        <label className="input-label">Select Exam</label>
        {loadingExams ? (
          <div className="grid grid-cols-3 gap-2">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-20 glass-card animate-pulse rounded-xl" />)}</div>
        ) : exams.length === 0 ? (
          <div className="glass-card p-4 text-slate-400 text-sm text-center">No exam pin pricing configured yet.</div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {exams.map((exam) => (
              <button key={exam.examName}
                onClick={() => setSelectedExam(exam)}
                className={`p-3 rounded-xl border text-center transition-all ${selectedExam?.examName === exam.examName ? 'border-brand-blue/50 bg-brand-blue/10' : 'glass-card hover:border-white/20'}`}>
                <GraduationCap size={18} className={`mx-auto mb-1.5 ${selectedExam?.examName === exam.examName ? 'text-brand-cyan' : 'text-slate-400'}`} />
                <p className="font-display font-bold text-white text-xs leading-tight">{EXAM_LABELS[exam.examName] || exam.examName}</p>
                <p className="text-xs text-slate-400 mt-1">{formatNaira(exam.sellingPrice)}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedExam && (
        <>
          <div>
            <label className="input-label">Quantity (max 5)</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-white hover:border-white/20">
                <Minus size={16} />
              </button>
              <span className="font-display text-xl font-bold text-white w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(5, quantity + 1))}
                className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-white hover:border-white/20">
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="glass-card p-5 space-y-4">
            <h3 className="font-display font-semibold text-sm text-slate-400 uppercase tracking-wider">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Exam</span>
                <span className="text-white font-medium">{selectedExam.examName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Quantity</span>
                <span className="text-white font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Amount</span>
                <span className="font-display font-bold text-white">{formatNaira(totalAmount)}</span>
              </div>
            </div>
            <button onClick={handleBuy} disabled={loading}
              className="btn-primary w-full justify-center gap-2 py-3.5 text-base disabled:opacity-60">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing…</span>
                : <><GraduationCap size={17} />Buy for {formatNaira(totalAmount)}</>
              }
            </button>
          </div>
        </>
      )}
    </div>
  )
}
