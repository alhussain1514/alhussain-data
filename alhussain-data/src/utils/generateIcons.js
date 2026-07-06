// Run this to generate placeholder icons
// Replace with real icons later using any image editor
import fs from 'fs'
import path from 'path'

// Create a simple SVG icon and convert note
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="80" fill="#0A0F1E"/>
  <circle cx="256" cy="256" r="200" fill="none" stroke="#3B82F6" stroke-width="20"/>
  <text x="256" y="200" text-anchor="middle" fill="#3B82F6" font-size="80" font-family="Arial" font-weight="bold">AHD</text>
  <text x="256" y="320" text-anchor="middle" fill="#06B6D4" font-size="40" font-family="Arial">DATA</text>
</svg>`

fs.writeFileSync('/workspaces/alhussain-data/alhussain-data/public/icon.svg', svgIcon)
console.log('SVG icon created at public/icon.svg')
console.log('Convert to PNG using: https://cloudconvert.com/svg-to-png')
console.log('Create 192x192 → save as public/icon-192.png')
console.log('Create 512x512 → save as public/icon-512.png')
