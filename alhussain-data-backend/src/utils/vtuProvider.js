import axios from 'axios'

const vtuClient = axios.create({
  baseURL: process.env.VTU_BASE_URL,
  timeout: 20000,
  headers: {
    'Authorization': `Token ${process.env.VTU_TOKEN}`,
    'Content-Type': 'application/json',
  },
})

const NETWORK_MAP = { MTN: 1, AIRTEL: 3, GLO: 2, '9MOBILE': 4 }

export const vtuProvider = {
  async buyData({ network, planId, phone, providerPlanId }) {
    // providerPlanId is the real Bigi Sub numeric plan ID
    const bigiPlanId = parseInt(providerPlanId || planId)
    const res = await vtuClient.post('/api/v2/vtu/data/purchase/', {
      plan: bigiPlanId,
      phone_number: phone,
      pin: process.env.VTU_PIN,
    })
    return res.data
  },

  async buyAirtime({ network, phone, amount }) {
    const res = await vtuClient.post('/api/v2/vtu/airtime/purchase/', {
      network: NETWORK_MAP[network.toUpperCase()],
      phone_number: phone,
      amount: String(amount),
      airtime_type: 'vtu',
      pin: process.env.VTU_PIN,
    })
    return res.data
  },

  async verifyMeter({ disco, meterType, meterNumber }) {
    const res = await vtuClient.post('/api/v2/bills/electricity/verify/', {
      disco_code: disco,
      meter_number: meterNumber,
      meter_type: meterType,
    })
    return {
      name: res.data.data?.Customer_name,
      address: res.data.data?.address,
    }
  },

  async payElectricity({ disco, meterType, meterNumber, amount }) {
    const verifyRes = await vtuClient.post('/api/v2/bills/electricity/verify/', {
      disco_code: disco,
      meter_number: meterNumber,
      meter_type: meterType,
    })
    const customerName = verifyRes.data.data?.Customer_name
    const res = await vtuClient.post('/api/v2/bills/electricity/pay/', {
      disco_code: disco,
      meter_number: meterNumber,
      meter_type: meterType,
      amount: String(amount),
      Customer_name: customerName,
      pin: process.env.VTU_PIN,
    })
    return {
      token: res.data.data?.token,
      units: res.data.data?.units,
    }
  },

  async verifyDecoder({ provider, smartcard }) {
    const res = await vtuClient.post('/api/v2/vtu/cable/verify/', {
      cable_name: provider,
      smartcard_number: smartcard,
    })
    return {
      name: res.data.data?.Customer_name,
      package: res.data.data?.current_bouquet,
    }
  },

  async payTV({ provider, smartcard, providerPlanId, amount }) {
    const verifyRes = await vtuClient.post('/api/v2/vtu/cable/verify/', {
      cable_name: provider,
      smartcard_number: smartcard,
    })
    const customerName = verifyRes.data.data?.Customer_name
    const res = await vtuClient.post('/api/v2/vtu/cable/purchase/', {
      cable_name: provider,
      smartcard_number: smartcard,
      variation_code: providerPlanId,
      Customer: customerName,
      pin: process.env.VTU_PIN,
    })
    return res.data
  },
}
