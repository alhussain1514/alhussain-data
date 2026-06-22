import axios from 'axios'

const vtuClient = axios.create({
  baseURL: process.env.VTU_BASE_URL,
  timeout: 20000,
  headers: {
    'api-key': process.env.VTU_API_KEY,
    'secret-key': process.env.VTU_SECRET_KEY,
    'Content-Type': 'application/json',
  },
})

/**
 * NOTE: Endpoint paths/payloads below follow a generic VTU-provider shape
 * (this mirrors common providers like VTpass/Clubkonnect). Adjust field
 * names to match whichever provider you contract with — the rest of the
 * codebase only depends on the function signatures below, not the provider.
 */

export const vtuProvider = {
  async buyData({ network, planId, phone, providerPlanId }) {
    const res = await vtuClient.post('/pay', {
      serviceID: network.toLowerCase(),
      variation_code: providerPlanId || planId,
      phone,
      request_id: `AHD${Date.now()}`,
    })
    return res.data
  },

  async buyAirtime({ network, phone, amount }) {
    const res = await vtuClient.post('/pay', {
      serviceID: network.toLowerCase(),
      amount,
      phone,
      request_id: `AHD${Date.now()}`,
    })
    return res.data
  },

  async verifyMeter({ disco, meterType, meterNumber }) {
    const res = await vtuClient.post('/merchant-verify', {
      billersCode: meterNumber,
      serviceID: disco,
      type: meterType,
    })
    return res.data // expected: { name, address, ... }
  },

  async payElectricity({ disco, meterType, meterNumber, amount, customerName }) {
    const res = await vtuClient.post('/pay', {
      serviceID: disco,
      billersCode: meterNumber,
      variation_code: meterType,
      amount,
      phone: customerName,
      request_id: `AHD${Date.now()}`,
    })
    return res.data // expected to include { token } for prepaid
  },

  async verifyDecoder({ provider, smartcard }) {
    const res = await vtuClient.post('/merchant-verify', {
      billersCode: smartcard,
      serviceID: provider,
    })
    return res.data // expected: { name, package, ... }
  },

  async payTV({ provider, smartcard, providerPlanId, amount }) {
    const res = await vtuClient.post('/pay', {
      serviceID: provider,
      billersCode: smartcard,
      variation_code: providerPlanId,
      amount,
      request_id: `AHD${Date.now()}`,
    })
    return res.data
  },
}
