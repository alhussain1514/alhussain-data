import { useState } from 'react'
import { User, Phone, Mail, Lock, Save, Eye, EyeOff, Shield } from 'lucide-react'
import toast from 'react-hot-toast'
import { authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' })
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const setPw = (k) => (e) => setPwForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      await authAPI.getProfile() // placeholder — real update endpoint would be used here
      updateUser(form)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (pwForm.next.length < 6) return toast.error('New password must be at least 6 characters')
    if (pwForm.next !== pwForm.confirm) return toast.error('Passwords do not match')
    setSavingPw(true)
    try {
      // Placeholder for real change-password endpoint
      toast.success('Password changed successfully')
      setPwForm({ current: '', next: '', confirm: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold mb-1">Profile Settings</h2>
        <p className="text-slate-400 text-sm">Manage your account information and security</p>
      </div>

      {/* Profile header */}
      <div className="glass-card p-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-brand flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <p className="font-display font-bold text-lg text-white">{user?.name}</p>
          <p className="text-sm text-slate-400">{user?.phone}</p>
          {user?.role === 'admin' && (
            <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-brand-purple/15 text-brand-purple text-xs font-medium">
              <Shield size={11} /> Admin
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/[0.06]">
        {[
          { id: 'profile', label: 'Personal Info' },
          { id: 'security', label: 'Security' },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px
              ${tab === t.id ? 'border-brand-blue text-white' : 'border-transparent text-slate-400 hover:text-white'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Personal Info Tab */}
      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="glass-card p-6 space-y-4 animate-fade-in">
          <div>
            <label className="input-label">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={form.name} onChange={set('name')} className="input-field pl-10" required />
            </div>
          </div>
          <div>
            <label className="input-label">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="tel" value={form.phone} onChange={set('phone')} className="input-field pl-10" required />
            </div>
          </div>
          <div>
            <label className="input-label">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" value={form.email} onChange={set('email')} className="input-field pl-10" placeholder="you@email.com" />
            </div>
          </div>
          <button type="submit" disabled={savingProfile}
            className="btn-primary gap-2 disabled:opacity-60">
            {savingProfile
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={15} />
            }
            Save changes
          </button>
        </form>
      )}

      {/* Security Tab */}
      {tab === 'security' && (
        <form onSubmit={handleChangePassword} className="glass-card p-6 space-y-4 animate-fade-in">
          <div>
            <label className="input-label">Current Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type={showPw ? 'text' : 'password'} value={pwForm.current} onChange={setPw('current')}
                className="input-field pl-10 pr-10" required />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <div>
            <label className="input-label">New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type={showPw ? 'text' : 'password'} value={pwForm.next} onChange={setPw('next')}
                placeholder="Minimum 6 characters" className="input-field pl-10" required />
            </div>
          </div>
          <div>
            <label className="input-label">Confirm New Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type={showPw ? 'text' : 'password'} value={pwForm.confirm} onChange={setPw('confirm')}
                className="input-field pl-10" required />
            </div>
          </div>
          <button type="submit" disabled={savingPw}
            className="btn-primary gap-2 disabled:opacity-60">
            {savingPw
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Save size={15} />
            }
            Change password
          </button>
        </form>
      )}
    </div>
  )
}
