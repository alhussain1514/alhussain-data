import axios from 'axios'

// VTpass requires Basic Auth: username = your email, password = your VTpass password
const vtuClient = axios.create({
  baseURL: process.env.VTU_BASE_URL,
  timeout: 20000,
  auth: {
    username: process.env.VTU_USERNAME,
    password: process.env.VTU_PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
  },
})

const NETWORK_MAP = { MTN:'mtn', AIRTEL:'airtel', GLO:'glo', '9MOBILE':'etisalat' }
const TV_MAP = { dstv:'dstv', gotv:'gotv', startimes:'startimes' }
const DISCO_MAP = { aedc:'abuja-electric', ekedc:'eko-electric', ibedc:'ibadan-electric', ikedc:'ikeja-electric', phedc:'portharcourt-electric', eedc:'enugu-electric', kaedco:'kaduna-electric', kedc:'kano-electric' }

export const vtuProvider = {
  async buyData({ network, planId, phone, providerPlanId }) {
    const res = await vtuClient.post('/pay', {
      request_id: `AHD${Date.now()}`,
      serviceID: NETWORK_MAP[network.toUpperCase()] + '-data',
      billersCode: phone,
      variation_code: providerPlanId || planId,
      amount: '',
      phone,
    })
    return res.data
  },
  async buyAirtime({ network, phone, amount }) {
    const res = await vtuClient.post('/pay', {
      request_id: `AHD${Date.now()}`,
      serviceID: NETWORK_MAP[network.toUpperCase()],
      amount,
      phone,
    })
    return res.data
  },
  async verifyMeter({ disco, meterType, meterNumber }) {
    const res = await vtuClient.post('/merchant-verify', {
      billersCode: meterNumber,
      serviceID: DISCO_MAP[disco.toLowerCase()] + (meterType === 'prepaid' ? '-prepaid' : '-postpaid'),
    })
    return res.data
  },
  async payElectricity({ disco, meterType, meterNumber, amount }) {
    const res = await vtuClient.post('/pay', {
      request_id: `AHD${Date.now()}`,
      serviceID: DISCO_MAP[disco.toLowerCase()] + (meterType === 'prepaid' ? '-prepaid' : '-postpaid'),
      billersCode: meterNumber,
      variation_code: meterType,
      amount,
      phone: meterNumber,
    })
    return res.data
  },
  async verifyDecoder({ provider, smartcard }) {
    const res = await vtuClient.post('/merchant-verify', {
      billersCode: smartcard,
      serviceID: TV_MAP[provider.toLowerCase()],
    })
    return res.data
  },
  async payTV({ provider, smartcard, providerPlanId, amount }) {
    const res = await vtuClient.post('/pay', {
      request_id: `AHD${Date.now()}`,
      serviceID: TV_MAP[provider.toLowerCase()],
      billersCode: smartcard,
      variation_code: providerPlanId,
      amount,
      phone: smartcard,
    })
    return res.data
  },
}
