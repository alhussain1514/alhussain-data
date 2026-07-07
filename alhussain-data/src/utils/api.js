import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ahd_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ahd_token')
      localStorage.removeItem('ahd_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ── Auth ──
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  getProfile: () => api.get('/auth/profile'),
}

// ── Wallet ──
export const walletAPI = {
  getBalance: () => api.get('/wallet/balance'),
  initiateFunding: (amount) => api.post('/wallet/fund/initiate', { amount }),
  verifyFunding: (ref) => api.get(`/wallet/fund/verify/${ref}`),
  getTransactions: (page = 1) => api.get(`/wallet/transactions?page=${page}`),
  withdraw: (data) => api.post('/wallet/withdraw', data),
}

// ── VTU Services ──
export const vtuAPI = {
  // Data
  getDataPlans: (network) => api.get(`/vtu/data/plans/${network}`),
  buyData: (data) => api.post('/vtu/data/buy', data),

  // Airtime
  buyAirtime: (data) => api.post('/vtu/airtime/buy', data),

  // Electricity
  verifyMeter: (data) => api.post('/vtu/electricity/verify', data),
  payElectricity: (data) => api.post('/vtu/electricity/pay', data),

  // TV
  verifyDecoder: (data) => api.post('/vtu/tv/verify', data),
  payTV: (data) => api.post('/vtu/tv/pay', data),
}

// ── Referral ──
export const referralAPI = {
  getInfo: () => api.get('/referral/info'),
  getReferrals: () => api.get('/referral/list'),
}

// ── Admin ──
export const adminAPI = {
  getUsers: (page = 1) => api.get(`/admin/users?page=${page}`),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  fundUser: (id, amount) => api.post(`/admin/users/${id}/fund`, { amount }),
  getTransactions: (page = 1) => api.get(`/admin/transactions?page=${page}`),
  updatePricing: (data) => api.put('/admin/pricing', data),
  getDashboardStats: () => api.get('/admin/stats'),
}

export default api

export const updateUserStatus = (id, status) => api.put(`/admin/users/${id}/status`, { status })
