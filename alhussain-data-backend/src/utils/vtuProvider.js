import axios from 'axios'
import { ELECTRICITY_PROVIDERS } from '../data/dembossPlans.js'

// ─────────────────────────────────────────────────────────────────────────
// DEMBOSS DATA API — https://dembossdata.com/api/v1/
//
// IMPORTANT — read this before going live:
// Demboss's docs confirm the base URL, auth header, and payload shape for
// each action, but do NOT show a distinct "Endpoint:" line for the POST
// actions (only the GET user-details endpoint was shown explicitly as the
// base URL itself). The paths below (`airtime`, `data`, `cable`,
// `electricity`, `exam`) are our best inference from the sidebar structure
// of their docs. They are each overridable via env vars so a wrong guess
// is a one-line .env fix, not a code change — run one test transaction of
// each type after deploying and adjust DEMBOSS_*_PATH below if you get a
// 404 or "action not found" style response.
// ─────────────────────────────────────────────────────────────────────────

const BASE_URL = process.env.DEMBOSS_BASE_URL || 'https://dembossdata.com/api/v1/'
const API_TOKEN = process.env.DEMBOSS_API_TOKEN

const PATHS = {
  airtime: process.env.DEMBOSS_AIRTIME_PATH || 'airtime',
  data: process.env.DEMBOSS_DATA_PATH || 'data',
  cable: process.env.DEMBOSS_CABLE_PATH || 'cable',
  electricity: process.env.DEMBOSS_ELECTRICITY_PATH || 'electricity',
  exam: process.env.DEMBOSS_EXAM_PATH || 'exam',
}

if (!API_TOKEN) {
  // Fail loudly at boot rather than silently sending unauthenticated requests.
  console.warn('⚠️  DEMBOSS_API_TOKEN is not set. All VTU purchases will fail until it is configured in .env')
}

const dembossClient = axios.create({
  baseURL: BASE_URL,
  timeout: 25000,
  headers: {
    Authorization: `Token ${API_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// network name -> Demboss network ID
const NETWORK_CODES = { MTN: 1, GLO: 2, '9MOBILE': 3, AIRTEL: 4 }

// our internal disco key -> exact disco_name string Demboss expects
const DISCO_NAME_MAP = ELECTRICITY_PROVIDERS.reduce((map, d) => {
  map[d.key] = d.name
  return map
}, {})

function capitalize(word) {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

/**
 * Demboss returns `status: "success"|"error"` (lowercase, action result) and
 * a separate `Status: "successful"|"failed"` (transaction outcome). We treat
 * either an explicit failure signal as a hard failure; everything else that
 * comes back 2xx with a "success"/"successful" marker is treated as success.
 */
function assertProviderSuccess(data) {
  const statusLower = String(data?.status || '').toLowerCase()
  const statusCap = String(data?.Status || '').toLowerCase()
  const failed = statusLower === 'error' || statusLower === 'failed' || statusCap === 'failed'
  if (failed) {
    const err = new Error(data?.msg || data?.message || 'Demboss reported a failed transaction.')
    err.response = { data }
    throw err
  }
  return data
}

function networkCode(network) {
  const code = NETWORK_CODES[String(network).toUpperCase()]
  if (!code) throw Object.assign(new Error(`Unknown network "${network}".`), { statusCode: 400 })
  return code
}

function discoName(disco) {
  const name = DISCO_NAME_MAP[String(disco).toLowerCase()]
  if (!name) throw Object.assign(new Error(`Unknown DISCO "${disco}".`), { statusCode: 400 })
  return name
}

export const vtuProvider = {
  // GET user details / wallet balance on Demboss's side
  async getUserDetails() {
    const res = await dembossClient.get('')
    return assertProviderSuccess(res.data)
  },

  async buyAirtime({ network, phone, amount, ref }) {
    const res = await dembossClient.post(PATHS.airtime, {
      network: String(networkCode(network)),
      amount: String(amount),
      phone,
      airtime_type: 'VTU',
      ...(ref ? { ref } : {}),
    })
    return assertProviderSuccess(res.data)
  },

  async buyData({ network, phone, providerPlanId, ref }) {
    const res = await dembossClient.post(PATHS.data, {
      network: String(networkCode(network)),
      phone,
      data_plan: String(providerPlanId),
      ...(ref ? { ref } : {}),
    })
    return assertProviderSuccess(res.data)
  },

  async payTV({ provider, smartcard, providerPlanId, ref }) {
    const res = await dembossClient.post(PATHS.cable, {
      cablename: String(provider).toUpperCase(),
      smart_card_number: smartcard,
      cable_plan: String(providerPlanId),
      ...(ref ? { ref } : {}),
    })
    return assertProviderSuccess(res.data)
  },

  async payElectricity({ disco, meterType, meterNumber, amount, ref }) {
    const res = await dembossClient.post(PATHS.electricity, {
      disco_name: discoName(disco),
      meter_number: meterNumber,
      amount: String(amount),
      meter_type: capitalize(meterType), // "Prepaid" | "Postpaid"
      ...(ref ? { ref } : {}),
    })
    return assertProviderSuccess(res.data)
  },

  async buyResultChecker({ examName, quantity, ref }) {
    const res = await dembossClient.post(PATHS.exam, {
      exam_name: String(examName).toUpperCase(),
      quantity: String(quantity),
      ...(ref ? { ref } : {}),
    })
    return assertProviderSuccess(res.data)
  },

  // ── No pre-verification support ──────────────────────────────────────
  // Demboss's docs do not include a "verify meter" or "verify smartcard /
  // decoder" endpoint. Unlike some VTU providers, there is no way to
  // confirm a customer's name before charging their wallet. We surface
  // this explicitly (supported: false) so the frontend can show an honest
  // "please double-check this number" warning instead of faking a
  // verified customer name.
  async verifyMeter() {
    return { supported: false }
  },

  async verifyDecoder() {
    return { supported: false }
  },
}
