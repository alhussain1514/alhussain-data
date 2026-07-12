import 'dotenv/config'
import axios from 'axios'

const BASE_URL = process.env.DEMBOSS_BASE_URL || 'https://dembossdata.com/api/v1/'
const TOKEN = process.env.DEMBOSS_API_TOKEN || ''

console.log('--- Checking your .env values ---')
console.log('Base URL:', BASE_URL)
console.log('Token length:', TOKEN.length, 'characters')
console.log('Token (first 6):', TOKEN.slice(0, 6))
console.log('Token (last 6):', TOKEN.slice(-6))
console.log('Has leading/trailing space?', TOKEN !== TOKEN.trim() ? 'YES — THIS IS A PROBLEM' : 'no')
console.log('')

async function test(scheme) {
  try {
    const res = await axios.get(BASE_URL, {
      headers: { Authorization: `${scheme} ${TOKEN}`, Accept: 'application/json' },
    })
    console.log(`✅ ${scheme} — SUCCESS:`, JSON.stringify(res.data))
  } catch (err) {
    console.log(`❌ ${scheme} — FAILED:`, err.response?.status, JSON.stringify(err.response?.data || err.message))
  }
}

await test('Token')
await test('Bearer')
