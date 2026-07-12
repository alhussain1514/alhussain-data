# AL-HUSSAIN DATA — Backend

Node.js + Express + MongoDB API powering the AL-HUSSAIN DATA VTU platform, integrated with the **Demboss Data API** (`https://dembossdata.com/api/v1/`).

## Setup

```bash
npm install
cp .env.example .env   # fill in your real MONGO_URI, JWT_SECRET, PAYSTACK keys, DEMBOSS_API_TOKEN
npm run seed             # creates an admin account + seeds all Demboss data/TV plans
npm run dev               # starts on http://localhost:5000
```

**Default admin** (created by `npm run seed`, override via `.env`):
- Phone: `08000000000`
- Password: `Admin@12345`
- ⚠️ Change this immediately after your first login in production.

## Required `.env` values

See `.env.example` for the full list. The important ones:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string for signing tokens |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` | From your Paystack dashboard |
| `DEMBOSS_API_TOKEN` | From your Demboss dashboard → Settings → API Token |
| `CLIENT_URL` | Frontend URL, used for CORS |

## ⚠️ Before you go fully live: confirm Demboss's exact endpoint paths

Demboss's docs confirm the base URL, auth header (`Authorization: Token <token>`), and the request/response shape for each action — but did **not** show an explicit endpoint path for the POST actions (only the GET user-details call was shown as the bare base URL). `src/utils/vtuProvider.js` guesses `airtime`, `data`, `cable`, `electricity`, `exam` based on their docs' sidebar structure.

**Test each transaction type once with a small amount after deploying.** If any comes back 404 or "invalid action", set the matching override in `.env` (already scaffolded, just uncomment and fix):

```
DEMBOSS_AIRTIME_PATH=whatever-it-actually-is
```

No code change needed — just redeploy with the corrected env var.

## Architecture

```
src/
  models/        User, Transaction, Pricing — Mongoose schemas
  controllers/   business logic per domain
  routes/        Express routers, mounted in server.js
  middleware/    JWT auth guard, admin guard, error handler
  data/
    dembossPlans.js   Auto-generated from Demboss's plan CSVs — data plans,
                       cable plans, electricity DISCO name mapping
  utils/
    walletEngine.js   ← the core of the whole system
    vtuProvider.js     wraps the Demboss API
    paystack.js        wraps Paystack's API + webhook verification
    seed.js            admin account + pricing seeder (run once)
    seedPlans.js       re-syncs data/TV plans only (run whenever Demboss changes their plan list)
```

### The wallet engine is the spine of the app

Every naira that moves — buying data, paying a bill, funding via Paystack, admin manually crediting a user, referral bonuses — goes through `creditWallet()` or `debitWallet()` in `src/utils/walletEngine.js`. Both:

1. Open a MongoDB session/transaction (atomic — balance and transaction log can never go out of sync)
2. Check/update `user.walletBalance`
3. Write a `Transaction` document with `balanceBefore`/`balanceAfter` for a full audit trail
4. Roll back entirely if anything fails

If a VTU purchase debits the wallet but the Demboss call then fails, `resolveTransaction()` automatically refunds the user — they're never charged for a service that wasn't delivered.

### No meter / smartcard pre-verification

Demboss's docs don't include an endpoint to verify a meter number or smartcard/IUC before charging (unlike some VTU providers). `vtuProvider.verifyMeter()` and `verifyDecoder()` are honest about this — they return `{ supported: false }` rather than fabricating a customer name. The frontend shows a "please double-check this number, we can't verify it" warning instead. If Demboss adds this endpoint later, wire the real call into those two functions.

### Admin pricing control

Data plans, TV plans, and exam pin prices aren't hardcoded — they live in the `Pricing` collection (`costPrice` = what you pay Demboss, `sellingPrice` = what the customer pays), editable via `PUT /api/admin/pricing` or the Admin → Pricing page. This is how your margin is controlled without a redeploy.

⚠️ **JAMB's seeded price is a placeholder** — Demboss's docs list JAMB as a supported exam but don't publish an official pin price. Confirm the real price with Demboss and update it in Admin → Pricing before enabling JAMB purchases.

### Provider wallet balance

`GET /api/admin/provider-balance` calls Demboss's user-details endpoint live, so the admin dashboard shows your prepaid Demboss balance — so you know to top it up before it runs out mid-transaction.

## API Reference

All routes are prefixed `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account (`referralCode` optional) |
| POST | `/auth/login` | — | Returns `{ token, user }` |
| GET | `/auth/profile` | ✓ | Current user |
| PUT | `/auth/profile` | ✓ | Update name/email/phone |
| GET | `/wallet/balance` | ✓ | `{ balance }` |
| POST | `/wallet/fund/initiate` | ✓ | `{ amount }` → `{ authorization_url, reference }` |
| GET | `/wallet/fund/verify/:reference` | ✓ | Confirms + credits |
| POST | `/wallet/paystack/webhook` | — (signature-verified) | Paystack calls this directly |
| GET | `/wallet/transactions?page=1` | ✓ | Paginated history |
| GET | `/vtu/data/plans/:network` | ✓ | Plans for MTN/AIRTEL/GLO/9MOBILE |
| POST | `/vtu/data/buy` | ✓ | `{ network, planId, phone }` |
| POST | `/vtu/airtime/buy` | ✓ | `{ network, phone, amount }` |
| POST | `/vtu/electricity/verify` | ✓ | Returns `{ supported: false }` honestly |
| POST | `/vtu/electricity/pay` | ✓ | `{ disco, meterType, meterNumber, amount }` |
| GET | `/vtu/tv/plans/:provider` | ✓ | Plans for dstv/gotv/startimes/showmax |
| POST | `/vtu/tv/verify` | ✓ | Returns `{ supported: false }` honestly |
| POST | `/vtu/tv/pay` | ✓ | `{ provider, smartcard, planId }` |
| GET | `/vtu/result-checker/prices` | ✓ | Admin-editable exam pin prices |
| POST | `/vtu/result-checker/buy` | ✓ | `{ examName, quantity }` |
| GET | `/referral/info` | ✓ | `{ code, count, earnings }` |
| GET | `/admin/stats` | ✓ admin | Dashboard numbers incl. status breakdown |
| GET | `/admin/provider-balance` | ✓ admin | Live Demboss wallet balance |
| GET | `/admin/users?search=&page=` | ✓ admin | Paginated + searchable users |
| POST | `/admin/users/:id/fund` | ✓ admin | Manual wallet credit |
| PUT | `/admin/users/:id/status` | ✓ admin | Suspend/activate |
| GET | `/admin/transactions?status=&type=&search=&from=&to=&page=` | ✓ admin | Filterable transaction log |
| PUT | `/admin/pricing` | ✓ admin | Update data/TV/exam pricing |

## What's stubbed and needs attention before going fully live

- **Demboss endpoint paths** — see the warning above; verify with one real test transaction per service
- **Transactional email** (`forgotPassword`) — currently logs the reset link to console; wire up Resend/SendGrid/etc.
- **Withdrawal payout** (`wallet.controller.js → withdraw`) — currently just logs a pending transaction; integrate Paystack Transfers (or your payout rail) to actually disburse funds
- **JAMB exam pin price** — placeholder, confirm with Demboss

## Deployment

- Push this folder to its own repo (or a subfolder of one)
- Deploy to **Render** or **Railway** (Node service, build: `npm install`, start: `npm start`)
- Set every `.env.example` value in the host's environment variable settings
- Point `CLIENT_URL` at your deployed Vercel frontend URL
- In your Paystack dashboard, set the webhook URL to `https://<your-backend>/api/wallet/paystack/webhook`
- After first deploy, run `npm run seed` once (via the host's shell/console) to create the admin account and load Demboss's plan catalog
