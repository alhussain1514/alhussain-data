import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import WhatsAppButton from '../components/WhatsAppButton'
import { ArrowRight, Check, Wifi, Phone, Zap, Tv, Wallet, Gift } from 'lucide-react'

const WHATSAPP_LINK = 'https://wa.me/2347042728644'

const SERVICES = [
  { icon: Wifi, label: 'Data Bundles', desc: 'MTN, Airtel, Glo & 9Mobile bundles at the best rates — daily, weekly, or monthly.', color: 'text-brand-blue', bg: 'bg-brand-blue/10', gradient: 'from-brand-blue to-brand-cyan' },
  { icon: Phone, label: 'Airtime Top-up', desc: 'Instantly recharge any Nigerian network, for yourself or for someone else.', color: 'text-emerald-400', bg: 'bg-emerald-400/10', gradient: 'from-emerald-400 to-brand-cyan' },
  { icon: Zap, label: 'Electricity Bills', desc: 'Pay AEDC, EKEDC, IBEDC, and all DISCOs. Token delivered instantly.', color: 'text-yellow-400', bg: 'bg-yellow-400/10', gradient: 'from-yellow-400 to-orange-400' },
  { icon: Tv, label: 'TV Subscription', desc: 'Renew DStv, GOtv, and Startimes without visiting any vendor or agent.', color: 'text-brand-purple', bg: 'bg-brand-purple/10', gradient: 'from-brand-purple to-brand-blue' },
  { icon: Wallet, label: 'Secure Wallet', desc: 'Fund via Paystack, track every naira. Your money, always under your control.', color: 'text-brand-cyan', bg: 'bg-brand-cyan/10', gradient: 'from-brand-cyan to-emerald-400' },
  { icon: Gift, label: 'Referral Rewards', desc: 'Invite friends and earn wallet bonuses for every successful referral.', color: 'text-red-400', bg: 'bg-red-400/10', gradient: 'from-red-400 to-yellow-400' },
]

const STATS = [
  { num: '50K+', label: 'Active users' },
  { num: '₦500M+', label: 'Processed' },
  { num: '99.9%', label: 'Uptime' },
  { num: '4', label: 'Networks' },
]

const STEPS = [
  { num: '1', title: 'Create account', desc: 'Register with your phone number and email in under 60 seconds.' },
  { num: '2', title: 'Fund your wallet', desc: 'Add money securely via Paystack — bank transfer, card, or USSD.' },
  { num: '3', title: 'Choose a service', desc: 'Pick data, airtime, electricity, or TV. Enter the details.' },
  { num: '4', title: 'Instant delivery', desc: 'Your data activates, your token arrives — all within seconds.' },
]

const TRUST_ITEMS = ['No hidden charges', 'Instant delivery', '24/7 support']

export default function Landing() {
  return (
    <div className="min-h-screen bg-navy">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center px-6 md:px-16 pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
               style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />
        </div>

        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-cyan/25 bg-brand-cyan/10 text-brand-cyan text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse-slow" />
              Live & instant — Nigeria-wide
            </div>

            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-5">
              Buy Data &<br />
              Pay Bills in<br />
              <span className="text-gradient">Seconds.</span>
            </h1>

            <p className="text-slate-400 text-lg max-w-md mb-8 leading-relaxed">
              Fund your wallet, purchase data bundles for any network, pay electricity bills,
              and subscribe to TV packages — all from one secure platform.
            </p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Link to="/register" className="btn-primary btn-lg gap-2">
                Create free account <ArrowRight size={17} />
              </Link>
              <a href="#how" className="btn-ghost btn-lg">See how it works</a>
            </div>

            <div className="flex flex-wrap gap-5">
              {TRUST_ITEMS.map((t) => (
                <div key={t} className="flex items-center gap-1.5 text-slate-400 text-sm">
                  <Check size={14} className="text-emerald-400 flex-shrink-0" />
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-sm rounded-2xl p-6 animate-float wallet-glow"
                 style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #1E2A5E 50%, #312E81 100%)', border: '1px solid rgba(99,130,246,0.3)' }}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Wallet Balance</p>
                  <p className="font-display text-3xl font-bold text-white">₦12,450.00</p>
                </div>
                <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-400 to-yellow-500 opacity-90" />
              </div>
              <div className="flex justify-between items-end">
                <p className="font-display text-sm font-semibold tracking-wide text-white/90">AL-HUSSAIN DATA</p>
                <span className="text-xs text-white/40 uppercase tracking-wider bg-white/10 px-2 py-1 rounded">
                  Paystack
                </span>
              </div>
            </div>

            <div className="w-full max-w-sm space-y-2">
              {[
                { icon: '📶', name: 'MTN 2GB Data', time: 'Just now', amount: '−₦850', minus: true },
                { icon: '💰', name: 'Wallet Funded', time: '5 mins ago', amount: '+₦5,000', minus: false },
                { icon: '⚡', name: 'AEDC Electricity', time: 'Yesterday', amount: '−₦2,000', minus: true },
              ].map((tx, i) => (
                <div key={i} className="glass-card flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-base">
                      {tx.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{tx.name}</p>
                      <p className="text-xs text-slate-500">{tx.time}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold ${tx.minus ? 'text-red-400' : 'text-emerald-400'}`}>
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-white/[0.06] bg-navy-2">
        <div className="max-w-4xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl font-bold text-gradient">{s.num}</p>
              <p className="text-slate-400 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <section id="services" className="px-6 md:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="section-eyebrow">What we offer</p>
          <h2 className="section-heading mb-4">Everything you need,<br />one platform</h2>
          <p className="text-slate-400 text-base max-w-lg mb-12 leading-relaxed">
            From mobile data to electricity tokens — buy, pay, and manage it all in seconds.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label}
                     className="glass-card p-6 hover:border-white/15 transition-all duration-200 hover:-translate-y-1 group relative overflow-hidden cursor-default">
                  <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${s.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className={`w-12 h-12 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                    <Icon size={22} className={s.color} />
                  </div>
                  <h3 className="font-display font-semibold text-base text-white mb-2">{s.label}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="how" className="bg-navy-2 px-6 md:px-16 py-24">
        <div className="max-w-6xl mx-auto">
          <p className="section-eyebrow">The process</p>
          <h2 className="section-heading mb-4">Up and running in minutes</h2>
          <p className="text-slate-400 text-base max-w-md mb-14 leading-relaxed">
            No paperwork. No delays. Just a smooth, four-step flow.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-7 left-full w-full h-px bg-white/[0.06] -translate-x-6" />
                )}
                <div className="w-14 h-14 rounded-full border border-white/10 bg-navy-3 flex items-center justify-center
                                font-display text-lg font-bold text-brand-blue mb-5">
                  {step.num}
                </div>
                <h3 className="font-display font-semibold text-base text-white mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 md:px-16 py-24 text-center">
        <div className="max-w-xl mx-auto glass-card p-12"
             style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.35), rgba(49,46,129,0.25))' }}>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Start saving on every<br />recharge today
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-8">
            Join thousands of Nigerians who manage their digital life on AL-HUSSAIN DATA. Free to sign up, no commitments.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/register" className="btn-primary btn-lg">Create free account</Link>
            <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="btn-ghost btn-lg">Talk to us</a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] px-6 md:px-16 py-6 flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="font-display font-bold text-base flex items-center gap-2">
          AL-HUSSAIN <span className="text-brand-cyan">DATA</span>
        </Link>
        <p className="text-slate-500 text-sm">© 2025 AL-HUSSAIN DATA. All rights reserved.</p>
        <div className="flex gap-5">
          {[
            { label: 'Privacy', href: '#' },
            { label: 'Terms', href: '#' },
            { label: 'Contact', href: WHATSAPP_LINK, external: true },
          ].map((l) => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel={l.external ? 'noopener noreferrer' : undefined}
              className="text-slate-500 text-sm hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  )
}
