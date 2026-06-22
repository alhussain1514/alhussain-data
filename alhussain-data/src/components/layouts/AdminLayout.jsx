import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, Users, Receipt, Settings, LogOut, Menu, Shield } from 'lucide-react'

const ADMIN_NAV = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/transactions', label: 'Transactions', icon: Receipt },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (item) => item.exact
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className="flex h-screen bg-navy overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 h-full flex-col bg-navy-2 border-r border-white/[0.06]">
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-purple/20 flex items-center justify-center">
              <Shield size={14} className="text-brand-purple" />
            </div>
            <span className="font-display font-bold text-base">Admin Panel</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">AL-HUSSAIN DATA</p>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-0.5 list-none">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon
              const active = isActive(item)
              return (
                <li key={item.path}>
                  <Link to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${active
                        ? 'bg-brand-purple/15 text-brand-purple border border-brand-purple/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <Icon size={17} />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="px-3 pb-4 border-t border-white/[0.06] pt-4">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium
                       text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.06] bg-navy-2">
          <button className="md:hidden text-slate-400" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <span className="text-sm text-slate-400">Logged in as <span className="text-white font-medium">{user?.name}</span></span>
          <div className="w-8 h-8 rounded-full bg-brand-purple/20 flex items-center justify-center">
            <Shield size={14} className="text-brand-purple" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
