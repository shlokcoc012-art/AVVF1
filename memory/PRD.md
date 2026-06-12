# AstroVedicVani — Landing Page + Booking API + Admin Console

## Original Problem Statement
User requested: "import my website code from the selected GitHub repository" (`shlokcoc012-art/AVVF1`). After the repo was set up and running, user requested **P1: Admin dashboard to view/manage bookings**, choosing JWT-based auth with admin password `Nrp@1912`.

## Architecture
- **Frontend**: React 19 + Vite 8 + Tailwind 3 + React Router 7 (in `/app/frontend`)
  - `yarn start` runs `vite --host 0.0.0.0 --port 3000`
  - Routes: `/*` (public landing page), `/admin/login`, `/admin` (protected)
- **Backend**: FastAPI + Motor (async MongoDB) + bcrypt + PyJWT on port 8001
  - DB: `astrovedicvani`, collections: `bookings`, `users`, `login_attempts`
- **Database**: MongoDB (local, via supervisor)
- **Auth**: JWT (HS256, 12h TTL) via `Authorization: Bearer …`. Token stored in `localStorage` (`avv_admin_token`).

## API Endpoints
### Public
- `GET  /api/health`
- `POST /api/bookings` — create booking (used by cart-booking flow)

### Auth
- `POST /api/auth/login` → `{access_token, token_type, user}`
- `GET  /api/auth/me` (Bearer)

### Admin (all require Bearer + role=admin)
- `GET  /api/admin/bookings` (filters: `status`, `service`, `date_from`, `date_to`, `search`, `limit`, `skip`) → `{count, items, stats}`
- `GET  /api/admin/bookings/{id}` → full booking
- `PATCH /api/admin/bookings/{id}` → `{status?, notes?}`
- `GET  /api/admin/bookings/export` → CSV (respects filters)

## Implemented
### Jan 2026 — Repo Import
- Cloned `AVVF1` repo into `/app`; recreated missing `.env` files (gitignored)
- Fixed `pydantic_core` version mismatch on backend
- Verified booking flow end-to-end (POST /api/bookings → 201; landing page renders)

### Jan 2026 — Code-review fixes + Pre-commit hook
- Resolved all ESLint warnings/errors (clean `yarn lint` baseline): removed unused vars in `CartDrawer`, `ModernAstrology`, `TriComboPromo`; cleaned stale eslint-disable directives in `AdminDashboard`; documented `useInView` deps decision; extracted `SECTION_CONFIG`/`CROSS_COMBO`/`DIVINE_COMBO`/`SERVICE_PRICES`/`MODE_FEES` into `frontend/src/context/cartConstants.js` so Vite Fast-Refresh works
- Backend: removed unused imports in `server.py`/`coupon_service.py`; explicit init of `sub`/`pct` in `compute_discount` to satisfy static analyzers; 21/21 pytest still passing
- Added pre-commit hook (`scripts/pre-commit.sh` + `scripts/install-hooks.sh`): on each commit, runs ESLint on staged JS/JSX and `py_compile` + full pytest on staged backend files. Install once with `bash scripts/install-hooks.sh`. Bypass with `--no-verify`. Docs at `scripts/README.md`.

### Jan 2026 — Admin Dashboard (P1)
- **Backend**:
  - `auth.py` module: bcrypt password hashing, PyJWT token issuance, idempotent admin seeding from env, `get_current_admin` FastAPI dependency
  - `/api/auth/login` with brute-force lockout (5 fails / 15 min per `{ip}:{email}`)
  - `/api/admin/bookings*` endpoints with filters, search (case-insensitive on name/phone/email), status updates, internal notes, CSV export
  - Admin user auto-seeded on startup from `ADMIN_EMAIL` + `ADMIN_PASSWORD` env vars
  - Indexes: `users.email` (unique), `login_attempts.identifier`, `bookings.created_at`, `bookings.status`
- **Frontend**:
  - React Router added; `BrowserRouter` wraps app with public `/` and `/admin/*` routes
  - `AuthProvider` + `useAuth` hook + `authFetch` helper (auto-attaches Bearer, auto-logout on 401)
  - `AdminLogin` — cosmic gradient login form
  - `ProtectedRoute` — redirects unauthenticated to `/admin/login`
  - `AdminDashboard` — stats cards, filter bar (search/status/service/date range), bookings table with status pills, `BookingDetailDrawer` (full details, cart items, status buttons, internal notes textarea, save), CSV export button
  - Distinct dark cosmic aesthetic (radial purple→black gradient, amber accents) — visually distinct from amber-themed public site
- **Test credentials**: `admin@astrovedicvani.com` / `Nrp@1912`
- **Tested**: 21/21 backend pytest cases pass; all frontend critical flows pass via Playwright. One backend bug (naive-vs-aware datetime comparison in brute-force check) was found by the testing agent and fixed.

## Files of Note
- `/app/backend/server.py` — FastAPI app, auth + admin routes
- `/app/backend/auth.py` — JWT + bcrypt helpers + admin seeding
- `/app/backend/.env` — `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- `/app/backend/tests/test_admin_api.py` — pytest suite (21 cases)
- `/app/frontend/src/App.jsx` — BrowserRouter setup
- `/app/frontend/src/admin/AuthContext.jsx` + `useAuth.js` + `authContextObject.js`
- `/app/frontend/src/admin/AdminLogin.jsx`
- `/app/frontend/src/admin/AdminDashboard.jsx` (~530 lines — could be split)
- `/app/frontend/src/admin/ProtectedRoute.jsx`
- `/app/memory/test_credentials.md` — credentials

## Backlog (P1/P2)
- P1: SendGrid/Twilio notifications on new booking (`email_service.py` scaffolded — needs `SENDGRID_API_KEY`)
- P1: Use `X-Forwarded-For` for brute-force identifier (currently uses proxy IP behind k8s ingress)
- P2: Razorpay/Stripe paid checkout from CartDrawer
- P2: Pagination UI in admin table (backend already supports `limit`/`skip`)
- P2: Split `BookingDetailDrawer` into its own file for maintainability
- P2: Hand-photo upload to S3/Cloudinary for Hasth Rekha bookings
- P2: Rate limiting on public `POST /api/bookings`
- P2: Replace placeholder contact info (phone, email, address)
