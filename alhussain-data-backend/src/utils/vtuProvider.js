import axios from 'axios'
import { ELECTRICITY_PROVIDERS } from '../data/dembossPlans.js'

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
  console.warn('⚠️  DEMBOSS_API_TOKEN is not set. All VTU purchases will fail until it is configured in .env')
}

const AUTH_SCHEME = process.env.DEMBOSS_AUTH_SCHEME || 'Token'

const dembossClient = axios.create({
  baseURL: BASE_URL,
  timeout: 25000,
  headers: {
    Authorization: `${AUTH_SCHEME} ${API_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

dembossClient.interceptors.request.use((config) => {
  console.log(`→ DEMBOSS ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data || '')
  return config
})
dembossClient.interceptors.response.use(
  (response) => {
    console.log(`← DEMBOSS ${response.status}`, JSON.stringify(response.data))
    return response
  },
  (error) => {
    if (error.response) {
      console.error(`← DEMBOSS ERROR ${error.response.status}`, JSON.stringify(error.response.data))
    } else {
      console.error('← DEMBOSS ERROR (no response)', error.message)
    }
    return Promise.reject(error)
  }
)

const NETWORK_CODES = { MTN: 1, GLO: 2, '9MOBILE': 3, AIRTEL: 4 }

const EXAM_CODES = {
  WAEC: 1,
  NECO: 2,
  NABTEB: 3,
  JAMB: 4,
  WAECREGISTRATION: 5,
  NBAIS: 6,
}

const DISCO_NAME_MAP = ELECTRICITY_PROVIDERS.reduce((map, d) => {
  map[d.key] = d.name
  return map
}, {})

function capitalize(word) {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

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
      meter_type: capitalize(meterType),
      ...(ref ? { ref } : {}),
    })
    return assertProviderSuccess(res.data)
  },

  async buyResultChecker({ examName, quantity, ref }) {
    const exam = String(examName).toUpperCase()
    const res = await dembossClient.post(PATHS.exam, {
      exam_name: exam,
      exam: EXAM_CODES[exam],
      quantity: String(quantity),
      ...(ref ? { ref } : {}),
    })
    return assertProviderSuccess(res.data)
  },

  async verifyMeter() {
    return { supported: false }
  },

  async verifyDecoder() {
    return { supported: false }
  },
}
