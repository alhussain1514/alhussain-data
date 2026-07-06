import sharp from 'sharp'

const svg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#0A0F1E"/>
  <rect width="512" height="512" rx="80" fill="#1E3A8A" opacity="0.5"/>
  <circle cx="256" cy="220" r="60" fill="none" stroke="#3B82F6" stroke-width="16"/>
  <line x1="256" y1="160" x2="256" y2="280" stroke="#06B6D4" stroke-width="12" stroke-linecap="round"/>
  <line x1="196" y1="220" x2="316" y2="220" stroke="#06B6D4" stroke-width="12" stroke-linecap="round"/>
  <text x="256" y="360" text-anchor="middle" fill="#FFFFFF" font-size="72" font-family="Arial" font-weight="bold">AHD</text>
  <text x="256" y="420" text-anchor="middle" fill="#06B6D4" font-size="36" font-family="Arial">DATA</text>
</svg>`)

await sharp(svg).resize(192, 192).png().toFile('public/icon-192.png')
await sharp(svg).resize(512, 512).png().toFile('public/icon-512.png')
console.log('✅ Icons generated successfully')
