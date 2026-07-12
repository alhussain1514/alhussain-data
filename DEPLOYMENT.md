# Deployment Guide — AL-HUSSAIN DATA (Demboss Integration)

Follow this top to bottom in your GitHub Codespaces terminal. Two apps here:
`alhussain-data-backend` (API) and `alhussain-data` (frontend).

---

## 1. Local test in Codespaces

### Backend

```bash
cd alhussain-data-backend
npm install
cp .env.example .env
```

Open `.env` and fill in at minimum:
- `MONGO_URI` — create a free cluster at https://cloud.mongodb.com, get the connection string
- `JWT_SECRET` — any long random string
- `DEMBOSS_API_TOKEN` — from your Demboss dashboard → Settings → API Token
- `PAYSTACK_SECRET_KEY` / `PAYSTACK_PUBLIC_KEY` — from https://dashboard.paystack.com

Then:

```bash
npm run seed          # creates admin account + loads all Demboss data/TV plans
npm run dev            # starts on http://localhost:5000
```

Make the port public: in the Codespaces "Ports" tab, find port `5000`, right-click → **Port Visibility → Public**. Copy the forwarded URL.

### Frontend

Open a second terminal:

```bash
cd alhussain-data
npm install
```

Edit `.env` (already exists) — set `VITE_API_URL` to your backend's forwarded URL + `/api`, e.g.:
```
VITE_API_URL=https://your-codespace-5000.app.github.dev/api
```

```bash
npm run dev
```

Open the forwarded frontend port, log in with the seeded admin (phone `08000000000`, password `Admin@12345`), and **test one transaction of each type** (data, airtime, TV, electricity, result checker) with small amounts to confirm Demboss's endpoints respond correctly. If any comes back as a 404/"invalid action" error, see the note in `alhussain-data-backend/README.md` about `DEMBOSS_*_PATH` overrides.

**Change the admin password immediately** after your first login.

---

## 2. Push to GitHub

```bash
cd /workspaces/<your-repo-name>   # repo root
git add .
git commit -m "Integrate Demboss Data API, real admin dashboard"
git push
```

(`.env` files are gitignored — you'll re-enter secrets as environment variables on each host below.)

---

## 3. Production deployment

### Database — MongoDB Atlas
Already set up if you did step 1. Just make sure your Atlas cluster's Network Access allows `0.0.0.0/0` (or your hosting provider's IP range) so Render/Railway can reach it.

### Backend — Render (or Railway)

1. New → Web Service → connect your GitHub repo
2. Root directory: `alhussain-data-backend`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add every variable from `.env.example` in the dashboard's Environment tab (real values)
6. Deploy. Once live, run the seed command once — Render: use the **Shell** tab and run `npm run seed`

Copy your live backend URL (e.g. `https://alhussain-data-backend.onrender.com`).

### Frontend — Vercel

1. New Project → import your repo
2. Root directory: `alhussain-data`
3. Framework preset: Vite (auto-detected)
4. Environment variable: `VITE_API_URL` = `https://alhussain-data-backend.onrender.com/api`
5. Deploy

### Wire them together

1. In Render's backend environment variables, set `CLIENT_URL` to your Vercel URL (for CORS)
2. In your Paystack dashboard → Settings → Webhooks, set the webhook URL to:
   `https://alhussain-data-backend.onrender.com/api/wallet/paystack/webhook`
3. Redeploy the backend so the new `CLIENT_URL` takes effect

---

## 4. Post-launch checklist

- [ ] Changed the default admin password
- [ ] Ran one real test transaction per service type (data, airtime, TV, electricity, result checker) and confirmed success
- [ ] Confirmed Demboss wallet balance shows correctly on Admin → Dashboard
- [ ] Set real selling prices in Admin → Pricing (seeded prices default to Demboss's own retail "User Price" — you'll want your own margin)
- [ ] Confirmed JAMB's placeholder price in Admin → Pricing → Exam Pins against Demboss's real price
- [ ] Tested Paystack funding end-to-end, including the webhook (fund a small amount and confirm wallet balance updates)
- [ ] Whenever Demboss changes their plan list/IDs: regenerate `alhussain-data-backend/src/data/dembossPlans.js` from a fresh CSV export and run `npm run seed-plans`
