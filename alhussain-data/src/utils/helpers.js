// Format naira amounts
export const formatNaira = (amount) => {
  const num = parseFloat(amount) || 0
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(num)
}

// Format dates
export const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// Format date short
export const formatDateShort = (dateStr) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })
}

// Truncate text
export const truncate = (str, n = 30) =>
  str?.length > n ? str.slice(0, n) + '…' : str

// Network metadata
export const NETWORKS = {
  MTN: { label: 'MTN', color: '#FFD700', bg: 'bg-yellow-400/10', text: 'text-yellow-400' },
  AIRTEL: { label: 'Airtel', color: '#FF0000', bg: 'bg-red-400/10', text: 'text-red-400' },
  GLO: { label: 'Glo', color: '#00A651', bg: 'bg-green-400/10', text: 'text-green-400' },
  '9MOBILE': { label: '9mobile', color: '#00B140', bg: 'bg-emerald-400/10', text: 'text-emerald-400' },
}

export const NETWORK_LIST = ['MTN', 'AIRTEL', 'GLO', '9MOBILE']

// TV providers
export const TV_PROVIDERS = [
  { id: 'dstv', label: 'DStv', icon: '📺' },
  { id: 'gotv', label: 'GOtv', icon: '📡' },
  { id: 'startimes', label: 'Startimes', icon: '🌟' },
  { id: 'showmax', label: 'Showmax', icon: '🎬' },
]

// Electricity DISCOs — keys must match the disco keys in the backend's
// ELECTRICITY_PROVIDERS list (src/data/dembossPlans.js) exactly.
export const DISCOS = [
  { id: 'abuja', label: 'AEDC (Abuja)' },
  { id: 'benin', label: 'BEDC (Benin)' },
  { id: 'eko', label: 'EKEDC (Eko)' },
  { id: 'enugu', label: 'EEDC (Enugu)' },
  { id: 'ibadan', label: 'IBEDC (Ibadan)' },
  { id: 'ikeja', label: 'IKEDC (Ikeja)' },
  { id: 'jos', label: 'JED (Jos)' },
  { id: 'kaduna', label: 'KAEDC (Kaduna)' },
  { id: 'kano', label: 'KEDCO (Kano)' },
  { id: 'portharcourt', label: 'PHEDC (Port Harcourt)' },
  { id: 'yola', label: 'YEDC (Yola)' },
]

// Transaction status helpers
export const txStatusColor = (status) => {
  switch (status) {
    case 'success': return 'text-emerald-400 bg-emerald-400/10'
    case 'pending': return 'text-yellow-400 bg-yellow-400/10'
    case 'failed': return 'text-red-400 bg-red-400/10'
    default: return 'text-slate-400 bg-slate-400/10'
  }
}

export const txStatusLabel = (status) => {
  switch (status) {
    case 'success': return '✓ Success'
    case 'pending': return '⏳ Pending'
    case 'failed': return '✕ Failed'
    default: return status
  }
}

// Service type icons and labels
export const TX_TYPES = {
  data: { icon: '📶', label: 'Data Bundle' },
  airtime: { icon: '📱', label: 'Airtime' },
  electricity: { icon: '⚡', label: 'Electricity' },
  tv: { icon: '📺', label: 'TV Subscription' },
  result_checker: { icon: '🎓', label: 'Result Checker' },
  wallet_fund: { icon: '💰', label: 'Wallet Funding' },
  withdrawal: { icon: '🏦', label: 'Withdrawal' },
  referral: { icon: '🎁', label: 'Referral Bonus' },
}
