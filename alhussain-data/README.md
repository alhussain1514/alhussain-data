# AL-HUSSAIN DATA — Frontend (Phase 1)

A fintech VTU platform frontend built with React, Vite, and Tailwind CSS.

## What's included

**Public pages**
- Landing page (hero, services, how-it-works, CTA)
- Login / Register (2-step) / Forgot password

**User dashboard** (`/dashboard`)
- Overview (wallet card, quick actions, recent transactions, referral widget)
- Buy Data (network + plan picker)
- Buy Airtime
- Pay Electricity (meter verification flow)
- TV Subscription (decoder verification + plans)
- Fund Wallet (Paystack redirect flow)
- Transaction history (search + filter)
- Referral program
- Profile settings (info + password)

**Admin panel** (`/admin`)
- Overview stats
- User management (search, manual wallet funding)
- Transaction monitoring (search, filter by status)

## Setup

```bash
npm install
npm run dev
```

Create a `.env` file in the root:

```
VITE_API_URL=http://localhost:5000/api
```

This points the frontend to your Phase 2 backend (Node/Express). Until that backend exists, every page falls back to realistic **demo data** so the UI is fully clickable and presentable to the client right now.

## How the API layer is structured

All backend calls live in `src/utils/api.js`, grouped by domain:
- `authAPI` — register, login, forgot/reset password, profile
- `walletAPI` — balance, fund (Paystack init/verify), transactions, withdraw
- `vtuAPI` — data, airtime, electricity (verify + pay), TV (verify + pay)
- `referralAPI` — referral info + list
- `adminAPI` — users, fund user, transactions, stats, pricing

When Phase 2 (backend) is built, none of the page components need to change — just point `VITE_API_URL` at the real server and the demo-data fallbacks stop firing since real responses will succeed.

## Auth flow

`src/context/AuthContext.jsx` manages the logged-in user and JWT token in `localStorage`. Protected routes (`/dashboard/*`) redirect to `/login` if there's no user; admin routes (`/admin/*`) additionally check `user.role === 'admin'`.

## Design system

- Colors, fonts, and animations are defined in `tailwind.config.js`
- Shared component classes (`.btn-primary`, `.input-field`, `.glass-card`, etc.) are in `src/index.css`
- Palette: navy base, electric blue + cyan accents, purple highlights — built to read as a serious fintech product

## Next: Phase 2

Backend build will implement the actual endpoints listed above (Node.js + Express + MongoDB + JWT), at which point this frontend connects with zero UI changes.
