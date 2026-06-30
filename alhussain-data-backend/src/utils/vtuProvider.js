import axios from 'axios'

const vtuClient = axios.create({
  baseURL: process.env.VTU_BASE_URL,
  timeout: 20000,
  headers: {
    Authorization: `Bearer ${process.env.VTU_API_KEY}`,
    Accept: 'application/json',
  },
})

const NETWORK_CODES = { MTN: 1, GLO: 2, '9MOBILE': 3, AIRTEL: 4, SMILE: 5 }
const CABLE_CODES = { gotv: 1, dstv: 2, startimes: 3 }
const DISCO_CODES = {
  ikeja: 1, eko: 2, abuja: 3, kano: 4, enugu: 5,
  portharcourt: 6, ibadan: 7, kaduna: 8, jos: 9, benin: 10, yola: 11,
}

function capitalize(word) {
  if (!word) return word
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

function assertProviderSuccess(data) {
  if (data?.success === false || data?.status === 'failed' || data?.invalid === true) {
    const err = new Error(data?.error || 'SundayNetwork reported a failed transaction.')
    err.response = { data }
    throw err
  }
  return data
}

export const vtuProvider = {
  async buyData({ network, planId, phone, providerPlanId }) {
    const res = await vtuClient.post(
      '/data/',
      {
        network: NETWORK_CODES[network.toUpperCase()],
        mobile_number: phone,
        plan: providerPlanId || planId,
        Ported_number: false,
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return assertProviderSuccess(res.data)
  },

  async buyAirtime({ network, phone, amount }) {
    const res = await vtuClient.post(
      '/airtime/',
      {
        network: NETWORK_CODES[network.toUpperCase()],
        amount,
        mobile_number: phone,
        Ported_number: false,
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return assertProviderSuccess(res.data)
  },

  async verifyMeter({ disco, meterType, meterNumber }) {
    const discoId = DISCO_CODES[disco.toLowerCase()] || disco
    const res = await vtuClient.get('/electricity/validate.php', {
      params: { disco_id: discoId, meter_number: meterNumber, meter_type: meterType.toLowerCase() },
    })
    return assertProviderSuccess(res.data)
  },

  async payElectricity({ disco, meterType, meterNumber, amount, customerName, customerPhone, customerAddress }) {
    const discoId = DISCO_CODES[disco.toLowerCase()] || disco
    const res = await vtuClient.post(
      '/electricity/',
      {
        disco_name: discoId,
        meter_number: meterNumber,
        MeterType: capitalize(meterType),
        amount,
        Customer_Phone: customerPhone,
        customer_name: customerName,
        customer_address: customerAddress,
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return assertProviderSuccess(res.data)
  },

  async verifyDecoder({ provider, smartcard }) {
    const cableId = CABLE_CODES[provider.toLowerCase()] || provider
    const res = await vtuClient.post(
      '/cable/validate/',
      { cable_id: cableId, smart_card_number: smartcard },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return assertProviderSuccess(res.data)
  },

  async payTV({ provider, smartcard, providerPlanId, amount, customerName }) {
    const cableId = CABLE_CODES[provider.toLowerCase()] || provider
    const res = await vtuClient.post(
      '/cable/',
      {
        cablename: cableId,
        cableplan: providerPlanId,
        smart_card_number: smartcard,
        customer_name: customerName,
      },
      { headers: { 'Content-Type': 'application/json' } }
    )
    return assertProviderSuccess(res.data)
  },
}

vtuProvider.buyResultChecker = async function ({ examName, quantity }) {
  const res = await vtuClient.post(
    '/result_checker/purchase.php',
    { exam_name: examName, quantity },
    { headers: { 'Content-Type': 'application/json' } }
  )
  return assertProviderSuccess(res.data)
}
