# AstroVedicVani — Landing Page + Booking API

## Original Problem Statement
User asked to "extract the landing page" from GitHub repo `https://github.com/shlokcoc012-art/AVV2`. The repo was incomplete (missing `src/`), so the user uploaded a zip containing the full code. App is the **AstroVedicVani** astrology business landing page with appointment booking.

Follow-up (Jan 2026):
1. Remove "Tajik Astrology" and "Gemini Jyotish" from the site
2. Wire `BookingModal` submit + `CartDrawer` checkout to real FastAPI endpoints persisting to MongoDB

## Architecture
- **Frontend**: React 19 + Vite 8 + Tailwind CSS 3 (in `/app/frontend`)
  - `yarn start` runs `vite --host 0.0.0.0 --port 3000`
  - `vite.config.js` has `allowedHosts: true` so the preview proxy works
  - Frontend calls backend via relative `/api/*` (Kubernetes ingress routes it to port 8001)
- **Backend**: FastAPI + Motor (async MongoDB) on port 8001
  - DB: `astrovedicvani`, collection `bookings`
- **Database**: MongoDB (local, via supervisor)

## API Endpoints
- `GET  /api/health` → service health
- `POST /api/bookings` → create booking (Pydantic validation: name, 10-digit phone, optional email, service, concern, mode, optional cart_items + subtotal/mode_fee/total + from_cart flag). Returns `{ ok, id, status, message }`.
- `GET  /api/bookings?limit=50` → recent bookings (admin convenience)
- `GET  /api/bookings/{id}` → single booking detail

## Sections / Components
- Navbar (Services dropdown, Book Now)
- Hero (animated cosmic background, dual CTAs)
- Stats, Learnings (now 7 branches — Vedic, Parashari, Nadi, KP, Lal Kitab, Brighu Samhita, Jaimini)
- Services grid, PrashnKundali, TriComboPromo, ModernAstrology, Specialties, Testimonials
- Footer
- BookingModal (4-step: Service → Personal → Birth → Confirm; coupons FIRST50/ASTRO20/DIWALI25; cart summary shown on Review when `fromCart`)
- CartDrawer + CartButton (Tri-Combo and Divine combo pricing); `Proceed to Book` opens BookingModal pre-filled

## Implemented (Jan 2026)
- Ported the full Vite codebase into `/app/frontend`; supervisor-friendly start script + vite config
- Created minimal FastAPI backend; **upgraded** it to a real bookings API using Motor + Pydantic v2
- **Removed Tajik Astrology and Gemini Jyotish** from `Learnings.jsx` and `BookingModal.jsx` service list
- Wired `BookingModal.handleSubmit` → real `POST /api/bookings` (replacing the previous setTimeout mock)
- Cart context handed off into BookingModal so cart-initiated bookings persist line items + subtotal/total
- Added `data-testid` attributes (`booking-confirm-btn`, `booking-cart-summary`, `booking-cart-total`, `booking-error`)
- Verified end-to-end: direct booking + cart-initiated booking both stored in MongoDB; booking ID surfaced in success screen

## Files of Note
- `/app/backend/server.py` — FastAPI + Motor bookings API
- `/app/backend/requirements.txt` — fastapi, motor, pydantic[email], uvicorn, python-dotenv
- `/app/backend/.env` — MONGO_URL, DB_NAME
- `/app/frontend/src/components/BookingModal.jsx` — calls `POST /api/bookings`
- `/app/frontend/src/components/CartDrawer.jsx` — Proceed dispatches `openBooking` with `fromCart`
- `/app/frontend/src/components/Learnings.jsx` — 7 branches (Tajik/Gemini removed)
- `/app/frontend/src/App.jsx` — bridges cart → booking handoff with `fromCart` flag
- `/app/frontend/vite.config.js` — preview-host friendly config

## Backlog (P1/P2)
- P1: Admin login + dashboard UI to view/manage bookings
- P1: Email/WhatsApp notification on new booking (SendGrid / Twilio)
- P2: Razorpay integration for paid checkouts directly from CartDrawer
- P2: Hand-photo upload to S3/Cloudinary for Hasth Rekha bookings
- P2: Rate limiting on `POST /api/bookings`, basic spam protection
- P2: Replace placeholder contact info (phone, email, address)
