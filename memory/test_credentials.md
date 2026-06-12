# Test Credentials — AstroVedicVani

## Admin (JWT auth)
- **URL**: `/admin/login`
- **Email**: `admin@astrovedicvani.com`
- **Password**: `Nrp@1912`
- **Role**: `admin`
- After login token is stored in `localStorage` under key `avv_admin_token`

## Auth API endpoints
- `POST /api/auth/login`  → `{access_token, token_type, user}`
- `GET  /api/auth/me`     (Bearer token) → current admin
- `GET  /api/admin/bookings?status=&service=&date_from=&date_to=&search=&limit=&skip=`
- `GET  /api/admin/bookings/export?{filters}` → CSV download
- `GET  /api/admin/bookings/{id}` → single booking detail
- `PATCH /api/admin/bookings/{id}` → `{status?, notes?}`

## Brute force protection
- 5 failed attempts → 15 minute lockout per `{ip}:{email}` pair.

## Notes
- Auth uses `Authorization: Bearer <token>` header (no cookies).
- Admin user is seeded on app startup from `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars and is idempotent.
- Status values accepted by PATCH: `pending`, `contacted`, `confirmed`, `completed`, `cancelled`.
