import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Wifi, Phone, Zap, Tv, Wallet, Receipt,
  Gift, User, LogOut, Menu, X, ChevronRight, Bell, GraduationCap,
} from 'lucide-react'
import { formatNaira } from '../../utils/helpers'
import WhatsAppButton from '../WhatsAppButton'
import Logo from '../Logo'

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/dashboard/buy-data', label: 'Buy Data', icon: Wifi },
  { path: '/dashboard/buy-airtime', label: 'Buy Airtime', icon: Phone },
  { path: '/dashboard/electricity', label: 'Electricity', icon: Zap },
  { path: '/dashboard/tv', label: 'TV Subscription', icon: Tv },
  { path: '/dashboard/result-checker', label: 'Result Checker', icon: GraduationCap },
  { path: '/dashboard/fund-wallet', label: 'Fund Wallet', icon: Wallet },
  { path: '/dashboard/transactions', label: 'Transactions', icon: Receipt },
  { path: '/dashboard/referral', label: 'Referral', icon: Gift },
  { path: '/dashboard/profile', label: 'Profile', icon: User },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-full' : 'w-64'} h-full flex flex-col bg-navy-2 border-r border-white/[0.06]`}>
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <Link to="/" className="flex items-center">
          <Logo size={32} textClass="font-display font-bold text-lg tracking-tight" />
        </Link>
      </div>

      {/* Wallet mini card */}
      <div className="mx-4 mt-4 p-4 rounded-xl"
           style={{ background: 'linear-gradient(135deg,#1E3A8A,#312E81)' }}>
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Wallet Balance</p>
        <p className="font-display text-xl font-bold text-white">
          {formatNaira(user?.walletBalance || 0)}
        </p>
        <Link to="/dashboard/fund-wallet"
              className="mt-3 flex items-center gap-1 text-xs text-brand-cyan font-medium hover:text-white transition-colors">
          + Fund wallet <ChevronRight size={12} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5 list-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = isActive(item)
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={() => mobile && setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${active
                      ? 'bg-brand-blue/15 text-brand-blue border border-brand-blue/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon size={17} className={active ? 'text-brand-blue' : ''} />
                  {item.label}
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-cyan" />}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User + Logout */}
      <div className="px-3 pb-4 border-t border-white/[0.06] pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-500 truncate">{user?.phone || user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium
                     text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-150"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 h-full z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-navy-2 flex-shrink-0">
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>

          <div className="flex-1 md:flex-none">
            <h1 className="font-display font-semibold text-base text-white hidden md:block">
              {NAV_ITEMS.find(n => isActive(n))?.label || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-cyan border-2 border-navy-2" />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-brand flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
      <WhatsAppButton />
    </div>
  )
}
