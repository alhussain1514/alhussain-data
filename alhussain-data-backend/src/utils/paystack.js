import axios from 'axios'
import crypto from 'crypto'

const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
})

export const paystack = {
  /**
   * Initializes a transaction and returns the authorization_url
   * the frontend redirects the user to.
   */
  async initializeTransaction({ email, amount, reference, callbackUrl }) {
    const res = await paystackClient.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // Paystack expects kobo
      reference,
      callback_url: callbackUrl,
    })
    return res.data.data // { authorization_url, access_code, reference }
  },

  /**
   * Verifies a transaction by reference. Call this after redirect
   * AND trust the webhook as the source of truth for crediting wallets.
   */
  async verifyTransaction(reference) {
    const res = await paystackClient.get(`/transaction/verify/${reference}`)
    return res.data.data // { status, amount, customer, reference, ... }
  },

  /**
   * Validates that a webhook request genuinely came from Paystack
   * by comparing the x-paystack-signature header against an HMAC
   * of the raw request body using your secret key.
   */
  verifyWebhookSignature(rawBody, signature) {
    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest('hex')
    return hash === signature
  },
}
