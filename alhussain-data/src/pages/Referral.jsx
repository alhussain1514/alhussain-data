import { useState, useEffect } from 'react'
import { Copy, Check, Gift, Users, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { referralAPI } from '../utils/api'
import { formatNaira, formatDateShort } from '../utils/helpers'
import { useAuth } from '../context/AuthContext'

export default function Referral() {
  const { user } = useAuth()
  const [info, setInfo] = useState(null)
  const [referrals, setReferrals] = useState([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const [infoRes, listRes] = await Promise.allSettled([
        referralAPI.getInfo(),
        referralAPI.getReferrals(),
      ])
      if (infoRes.status === 'fulfilled') setInfo(infoRes.value.data)
      if (listRes.status === 'fulfilled') setReferrals(listRes.value.data.referrals || [])
    } catch {}
    setLoading(false)
  }

  const code = info?.code || user?.referralCode || 'AHD-0000'
  const link = `${window.location.origin}/register?ref=${code}`

  const copyLink = () => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const share = () => {
    if (navigator.share) {
      navigator.share({ title: 'Join AL-HUSSAIN DATA', text: 'Buy cheap data & pay bills easily!', url: link })
    } else copyLink()
  }

  const referralCount = info?.count ?? 0
  const referralEarnings = info?.earnings ?? 0
  const displayRefs = referrals

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">Referral Program</h2>
        <p className="text-slate-400 text-sm">Invite friends and earn ₦200 for every successful signup</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users, label: 'Referrals', value: referralCount, color: 'text-brand-blue' },
          { icon: TrendingUp, label: 'Earned', value: formatNaira(referralEarnings), color: 'text-emerald-400' },
          { icon: Gift, label: 'Per referral', value: '₦200', color: 'text-brand-cyan' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="glass-card p-4 text-center">
              <Icon size={18} className={`${s.color} mx-auto mb-2`} />
              <p className={`font-display text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-display font-semibold mb-4">Your Referral Link</h3>
        <div className="rounded-xl bg-brand-blue/5 border border-brand-blue/20 p-4 mb-4">
          <p className="text-xs text-slate-400 mb-1">Referral Code</p>
          <p className="font-display text-2xl font-bold text-brand-cyan tracking-widest">{code}</p>
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 mb-4">
          <p className="flex-1 text-sm text-slate-300 truncate">{link}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyLink} className="btn-ghost flex-1 justify-center gap-2">
            {copied ? <><Check size={15} className="text-emerald-400" />Copied!</> : <><Copy size={15} />Copy link</>}
          </button>
          <button onClick={share} className="btn-primary flex-1 justify-center gap-2">
            <Gift size={15} /> Share
          </button>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4">How it works</h3>
        <div className="space-y-4">
          {[
            { step: '1', text: 'Share your unique referral link with friends and family' },
            { step: '2', text: 'Friend signs up and funds their wallet with at least ₦500' },
            { step: '3', text: 'You instantly receive ₦200 credited to your wallet' },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-brand-blue/15 text-brand-blue flex items-center justify-center text-xs font-bold flex-shrink-0">
                {item.step}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pt-0.5">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-display font-semibold mb-4">Your Referrals</h3>
        {loading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-1/3 bg-white/5 rounded animate-pulse" />
                  <div className="h-2.5 w-1/4 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : displayRefs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">👥</div>
            <p className="text-slate-400 text-sm">No referrals yet. Start sharing your link!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayRefs.map((r) => (
              <div key={r._id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                  {r.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{r.name}</p>
                  <p className="text-xs text-slate-500">Joined {formatDateShort(r.joinedAt)}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-400">+{formatNaira(r.bonus || 200)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
