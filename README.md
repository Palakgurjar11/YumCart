# YumCart

Production-style **food ordering MERN-stack** demo: **React (Vite) + Tailwind** on the frontend, **Node.js / Express / MongoDB / JWT / Multer** on the backend, with **guest → authenticated cart merge**, **role-based admin tools**, and a **Swiggy / Zomato–inspired** UI polish.

```
YumCart/
├── client/     # React + Vite SPA
├── server/     # Express REST API + Mongoose models
└── README.md
```

---

## Prerequisites

| Tool | Notes |
|------|--------|
| **Node.js** | v18+ (uses native `fetch` ergonomics indirectly via deps; ES modules enabled) |
| **MongoDB** | Local daemon or Atlas cluster |
| **npm** | Package manager |

---

## 1. Backend (`server`)

### Environment

Copy `.env.example` → `.env` inside `server/`:

```bash
cd server
cp .env.example .env   # macOS/Linux — on Windows PowerShell copy manually
```

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Mongo connection string (`mongodb://127.0.0.1:27017/yumcart` locally) |
| `JWT_SECRET` | Long random string for HS256 signatures |
| `JWT_EXPIRES_IN` | Example: `7d` |
| `PORT` | API port (`5000` default) |
| `CLIENT_URL` | Allowed CORS origin (`http://localhost:5173` in dev) |
| `ADMIN_EMAIL` | Override bootstrap admin inbox (seed) |
| `SEED_ADMIN_PASSWORD` | Optional plaintext override for seeded admin (**dev only**) |

### Install & run API

```bash
cd server
npm install

# Seed admin + demo user + catalogue (optional but recommended first run)
npm run seed

npm run dev    # watches src/server.js
# or npm start
```

Healthy check: **GET** `http://localhost:5000/api/health` → `{ "ok": true }`.

**Deployed tip:** expose `CLIENT_URL` as your SPA origin (`https://app.example.com`). For multiple origins extend `server/src/server.js` CORS config.

---

## 2. Frontend (`client`)

### Environment

Optional `client/.env` (`VITE_API_URL`):

- **Local dev**: leave unset — Vite proxies `/api` + `/uploads` to `:5000` (see `client/vite.config.js`).
- **Production**: set full API origin (`https://api.example.com`). Do **not** include a trailing `/`.

### Install & dev server

```bash
cd client
npm install
npm run dev       # http://localhost:5173
```

### Production bundle

```bash
cd client
npm run build
npm run preview   # optional static smoke test
```

Serve `client/dist/` from Netlify/Vercel/S3+CloudFront. Ensure API reachable from browsers (CORS + HTTPS).

---

## 3. Seeded Demo Accounts (`npm run seed`)

| Role | Email | Password |
|------|-------|-----------|
| **Admin** | `admin@yumcart.com` *(or `ADMIN_EMAIL`)* | `Admin@123` *(or `SEED_ADMIN_PASSWORD`)* |
| **User** | `user@yumcart.com` | `User@123` |

> **Important:** wiping via seed removes **foods, carts & orders**. Use a dedicated sandbox DB folder for presentations.

Admin capabilities: CRUD catalogue (with image uploads mounted at `/uploads/foods/` on the API host), KPI stats, mutate order SLA chips.

---

## 4. API Surface (abbrev.)

| Prefix | Guards | Highlights |
|--------|--------|-----------|
| `/api/auth` | Mixed | Register, Login, JWT `GET/PATCH /me` |
| `/api/foods` | Public | List (search/category paging), Categories, `:id` |
| `/api/cart` | JWT user | Merge guest cart snapshot, mutate lines |
| `/api/orders` | JWT user | `POST /` checkout (clears Mongo cart snapshot) |
| `/api/admin` | JWT `role:admin` | Stats/foods/order ops |

Full routes live under `server/src/routes/` with controllers mirroring MVC expectations.

---

## 5. Security / Portfolio Notes

- JWT stored in **`localStorage`** for transparency — recruiters can critique & you can articulate swap to **`HttpOnly` cookies**.
- **`bcrypt`** hashes passwords in the `User` model `pre-save` hook.
- **Multer** writes binary assets under **`server/uploads`** — recreate directory on ephemeral hosts / mount persistent volume.

---

## 6. Tech Stack Dependencies (high level)

**Client:** `react`, `react-dom`, `react-router-dom`, `axios`, `react-hot-toast`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`, `vite`, ESLint toolchain.

**Server:** `express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `multer`, `cors`, `dotenv`, `express-validator`, `morgan`.

See each `package.json` for authoritative semver pins.

---

## 7. Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS failures | Align `CLIENT_URL` with SPA origin scheme/host/port |
| Empty menu | Hit `npm run seed` once DB running |
| 401 churn | Inspect `JWT_SECRET` consistency across restarts |
| Upload 500 | Ensure writable `uploads/` + valid image mime |
| Hydration quirks (dev) | React Strict Mode may double-mount — guest merge guarded but keep an eye on custom logging |

Happy shipping — extend with payments (Razorpay/Stripe webhooks), rate limiting (`express-rate-limit`), CI (GitHub Actions), and infra as code whenever you tighten the showcase.
