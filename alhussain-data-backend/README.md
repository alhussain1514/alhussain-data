# AL-HUSSAIN DATA — Backend (Phase 2–6)

Node.js + Express + MongoDB API powering the AL-HUSSAIN DATA frontend. This single backend covers:

- **Phase 2** — User system (register/login/JWT/bcrypt)
- **Phase 3** — Wallet engine (atomic credit/debit, transaction logging)
- **Phase 4** — Paystack integration (funding + webhook)
- **Phase 5** — VTU services (data, airtime, electricity, TV)
- **Phase 6** — Admin endpoints (users, transactions, pricing, stats)

## Setup

```bash
npm install
cp .env.example .env   # then fill in your real values
npm run seed            # creates an admin account + default pricing
npm run dev              # starts on http://localhost:5000
```

**Default admin** (created by `npm run seed`):
- Phone: `08000000000`
- Password: `Admin@12345`
- ⚠️ Change this immediately in production.

## Required `.env` values

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string for signing tokens |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` | From your Paystack dashboard |
| `VTU_BASE_URL` / `VTU_API_KEY` / `VTU_SECRET_KEY` | From your VTU provider (VTpass, Clubkonnect, etc.) |
| `CLIENT_URL` | Frontend URL, used for CORS + Paystack callback |

## Architecture

```
src/
  models/        User, Transaction, Pricing — Mongoose schemas
  controllers/   business logic per domain
  routes/        Express routers, mounted in server.js
  middleware/    JWT auth guard, admin guard, error handler
  utils/
    walletEngine.js   ← the core of the whole system
    vtuProvider.js     wraps the external VTU API
    paystack.js        wraps Paystack's API + webhook verification
    seed.js            admin account + pricing seeder
```

### The wallet engine is the spine of the app

Every single naira that moves — buying data, paying a bill, funding via Paystack, admin manually crediting a user, referral bonuses — goes through `creditWallet()` or `debitWallet()` in `src/utils/walletEngine.js`. Both:

1. Open a MongoDB session/transaction (atomic — balance and transaction log can never go out of sync)
2. Check/update `user.walletBalance`
3. Write a `Transaction` document with `balanceBefore`/`balanceAfter` for a full audit trail
4. Roll back entirely if anything fails

If a VTU purchase debits the wallet but the provider call then fails, `resolveTransaction()` automatically refunds the user — they're never charged for a service that wasn't delivered.

### Paystack flow

1. Frontend calls `POST /api/wallet/fund/initiate` → backend creates a `pending` transaction and asks Paystack for a checkout URL
2. User pays on Paystack's page, gets redirected back to the frontend
3. Frontend calls `GET /api/wallet/fund/verify/:reference` to confirm + credit immediately (good UX)
4. **Paystack's webhook** (`POST /api/wallet/paystack/webhook`) is the actual source of truth — it fires independently and credits the wallet even if the user closed their browser mid-redirect. Both paths are idempotent (checked via transaction status), so there's no double-crediting.

### VTU provider abstraction

`src/utils/vtuProvider.js` wraps whichever VTU API you contract with (VTpass, Clubkonnect, etc.) behind a stable set of functions: `buyData`, `buyAirtime`, `verifyMeter`, `payElectricity`, `verifyDecoder`, `payTV`. If you switch providers later, only this one file changes — no controller logic is affected.

### Admin pricing control

Data and TV plans aren't hardcoded — they live in the `Pricing` collection (`costPrice` vs `sellingPrice` per plan), editable via `PUT /api/admin/pricing`. This is how the business margin is controlled without a redeploy.

## API Reference

All routes are prefixed `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account (`referralCode` optional) |
| POST | `/auth/login` | — | Returns `{ token, user }` |
| GET | `/auth/profile` | ✓ | Current user |
| PUT | `/auth/profile` | ✓ | Update name/email/phone |
| POST | `/auth/forgot-password` | — | Sends reset link (logged to console — wire up an email provider) |
| POST | `/auth/reset-password` | — | `{ token, password }` |
| GET | `/wallet/balance` | ✓ | `{ balance }` |
| POST | `/wallet/fund/initiate` | ✓ | `{ amount }` → `{ authorization_url, reference }` |
| GET | `/wallet/fund/verify/:reference` | ✓ | Confirms + credits |
| POST | `/wallet/paystack/webhook` | — (signature-verified) | Paystack calls this directly |
| GET | `/wallet/transactions?page=1` | ✓ | Paginated history |
| POST | `/wallet/withdraw` | ✓ | `{ amount, bankCode, accountNumber, accountName }` |
| GET | `/vtu/data/plans/:network` | ✓ | Plans for MTN/AIRTEL/GLO/9MOBILE |
| POST | `/vtu/data/buy` | ✓ | `{ network, planId, phone }` |
| POST | `/vtu/airtime/buy` | ✓ | `{ network, phone, amount }` |
| POST | `/vtu/electricity/verify` | ✓ | `{ disco, meterType, meterNumber }` |
| POST | `/vtu/electricity/pay` | ✓ | `{ disco, meterType, meterNumber, amount }` |
| POST | `/vtu/tv/verify` | ✓ | `{ provider, smartcard }` |
| POST | `/vtu/tv/pay` | ✓ | `{ provider, smartcard, planId }` |
| GET | `/referral/info` | ✓ | `{ code, count, earnings }` |
| GET | `/referral/list` | ✓ | Referred users + bonus status |
| GET | `/admin/stats` | ✓ admin | Dashboard numbers |
| GET | `/admin/users` | ✓ admin | Paginated users |
| POST | `/admin/users/:id/fund` | ✓ admin | Manual wallet credit |
| PUT | `/admin/users/:id/status` | ✓ admin | Suspend/activate |
| GET | `/admin/transactions` | ✓ admin | All transactions, filterable |
| PUT | `/admin/pricing` | ✓ admin | Update data/TV plans + fees |

## What's stubbed and needs a real integration before going live

- **VTU provider** (`utils/vtuProvider.js`) — endpoint shapes are generic; match them to your actual contracted provider's docs
- **Transactional email** (`forgotPassword`) — currently logs the reset link to console; wire up Resend/SendGrid/etc.
- **Withdrawal payout** (`wallet.controller.js → withdraw`) — currently just logs a pending transaction; integrate Paystack Transfers (or your payout rail) to actually disburse funds

## Deployment (Phase 8)

- Push this folder to its own repo
- Deploy to **Render** or **Railway** (Node service, `npm start`)
- Set all `.env` values in the host's environment variable settings
- Point `CLIENT_URL` at your deployed Vercel frontend URL
- In your Paystack dashboard, set the webhook URL to `https://<your-backend>/api/wallet/paystack/webhook`
