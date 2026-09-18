# Karmel Café & Restaurant — Complete Codebase Audit Report

**Generated:** 2026-09-09  
**Repository:** \C:\Users\Test\Desktop\Karmel-Restaurant\African-Restaurant\  
**Purpose:** Complete inventory for test suite development

---

## 1. API Routes (\pp/api/**/*.ts\)

### Public Authentication Routes

| Endpoint | Method | Description | Rate Limit | Auth Required |
|----------|--------|-------------|------------|---------------|
| \/api/auth/[...nextauth]\ | GET, POST | NextAuth.js v5 handlers (sign in, callback, session, etc.) | — | No |
| \/api/register\ | POST | Create new user account with email + phone verification | \egister\ (5/hr per IP) | No |
| \/api/verify-email\ | POST | Verify 6-digit email OTP code | \otp\ (5/10min per email) | No |
| \/api/resend-otp\ | POST | Resend email verification code (no-op if already verified) | \otp\ (5/10min per email) | No |
| \/api/forgot-password\ | POST | Send password reset link via email | \otp\ (5/10min per email) | No |
| \/api/reset-password\ | POST | Reset password using token from email link | \otp\ (5/10min per email) | No |
| \/api/verify-phone\ | POST | Verify Firebase phone OTP (client SDK → ID token) | \otp\ (5/10min per phone) | No |

### Reservation Routes (Public + Admin)

| Endpoint | Method | Description | Rate Limit | Auth Required |
|----------|--------|-------------|------------|---------------|
| \/api/reservations\ | POST | Create new table reservation | \egister\ (5/hr per IP) | No |
| \/api/reservations\ | GET | List all reservations (admin only) | — | **Admin** |
| \/api/reservations/[id]\ | PATCH | Update reservation (status, table, change request) | — | **Admin** |
| \/api/reservations/[id]\ | DELETE | Delete reservation | — | **Admin** |
| \/api/reservations/respond\ | GET | Customer accepts/declines proposed time change via token | — | No (token-based) |

### Menu Routes

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| \/api/menu\ | GET | Public menu (categories + available items) | No |
| \/api/admin/menu\ | GET | Full menu (all items including unavailable) | **Admin** |
| \/api/admin/menu\ | POST | Create new menu item | **Admin** |
| \/api/admin/menu/[id]\ | PATCH | Update menu item | **Admin** |
| \/api/admin/menu/[id]\ | DELETE | Delete menu item | **Admin** |
| \/api/admin/menu-categories\ | POST | Create new menu category | **Admin** |
| \/api/admin/menu-categories/[id]\ | DELETE | Delete menu category | **Admin** |

### Admin-Only Routes

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| \/api/admin/notifications\ | GET | Poll for new reservations since timestamp | **Admin** |
| \/api/cron/cleanup\ | GET | GDPR cleanup (unverified accounts + old reservations) | **Bearer CRON_SECRET** |

---

## 2. Database Models (\prisma/schema.prisma\)

### Enums

\\\prisma
enum Role { USER, ADMIN }
enum ReservationStatus { PENDING, CONFIRMED, CANCELLED, CHANGE_REQUESTED }
\\\

### Models

#### \User\
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| \id\ | String | \@id @default(cuid())\ | Primary key |
| \
ame\ | String | — | Display name |
| \email\ | String | \@unique\ | Login email |
| \phone\ | String? | \@unique\ | Phone number (E.164 format) |
| \passwordHash\ | String? | — | bcrypt hash (null for OAuth users) |
| \ole\ | Role | \@default(USER)\ | USER or ADMIN |
| \emailVerified\ | DateTime? | — | Email verification timestamp |
| \image\ | String? | — | OAuth profile image |
| \emailOtp\ | String? | — | SHA-256 hash of email OTP |
| \emailOtpExpires\ | DateTime? | — | OTP expiry (10 min default) |
| \phoneVerified\ | DateTime? | — | Phone verification timestamp |
| \phoneOtp\ | String? | — | (unused, reserved) |
| \phoneOtpExpires\ | DateTime? | — | (unused, reserved) |
| \esetToken\ | String? | — | SHA-256 hash of password reset token |
| \esetTokenExpires\ | DateTime? | — | Reset token expiry (30 min) |
| \privacyConsentAt\ | DateTime? | — | GDPR consent timestamp |
| \createdAt\ | DateTime | \@default(now())\ | Account creation |
| \ccounts\ | Account[] | — | OAuth accounts |
| \sessions\ | Session[] | — | Active sessions |
| \eservations\ | Reservation[] | — | User's reservations |

#### \Account\ (NextAuth adapter)
Standard OAuth account linking table with \provider\, \providerAccountId\, tokens, etc.

#### \Session\ (NextAuth adapter)
Session table with \sessionToken\, \userId\, \expires\.

#### \VerificationToken\ (NextAuth adapter)
Email verification tokens for magic links (not used — app uses OTP instead).

#### \Reservation\
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| \id\ | String | \@id @default(cuid())\ | Primary key |
| \userId\ | String? | FK → User | Optional (guest reservations allowed) |
| \
ame\ | String | — | Guest name |
| \email\ | String | — | Guest email |
| \phone\ | String | — | Guest phone |
| \date\ | DateTime | — | Reservation date |
| \	ime\ | String | — | Time slot (e.g., "19:00") |
| \partySize\ | Int | — | Number of guests (1–30) |
| \	ableNumber\ | Int? | — | Assigned table |
| \
otes\ | String? | — | Special requests |
| \status\ | ReservationStatus | \@default(PENDING)\ | Booking status |
| \consentAt\ | DateTime? | — | GDPR consent timestamp |
| \esponseToken\ | String? | \@unique\ | Token for time-change acceptance |
| \equestedTime\ | DateTime? | — | Proposed new time (admin-initiated) |
| \createdAt\ | DateTime | \@default(now())\ | Booking creation |
| **Unique** | \(date, time, tableNumber)\ | — | Prevents double-booking same table |

#### \MenuCategory\
| Field | Type | Constraints |
|-------|------|-------------|
| \id\ | String | \@id @default(cuid())\ |
| \slug\ | String | \@unique\ |
| \	itle\ | String | — |
| \subtitle\ | String | — |
| \order\ | Int | \@default(0)\ |
| \items\ | MenuItem[] | — |
| \createdAt\ / \updatedAt\ | DateTime | — |

#### \MenuItem\
| Field | Type | Constraints |
|-------|------|-------------|
| \id\ | String | \@id @default(cuid())\ |
| \categoryId\ | String | FK → MenuCategory (cascade delete) |
| \
ame\ | String | — |
| \desc\ | String? | — |
| \price\ | String | — |
| \star\ | Boolean | \@default(false)\ (highlighted dish) |
| \vailable\ | Boolean | \@default(true)\ |
| \order\ | Int | \@default(0)\ |
| \createdAt\ / \updatedAt\ | DateTime | — |

---

## 3. Pages & Components

### Public Pages (\pp/\)

| Route | File | Description | Key Components |
|-------|------|-------------|----------------|
| \/\ | \pp/page.tsx\ | Single-page marketing site (Hero, Experience, Menu, Reservations, Location, Footer) | \MenuSection\, \ReservationForm\, \MapEmbed\, \Logo\, \CookieConsentBanner\ |
| \/login\ | \pp/login/page.tsx\ | Credentials + Google + Facebook login | — |
| \/register\ | \pp/register/page.tsx\ | Multi-step: form → email OTP → phone OTP → done | Firebase \RecaptchaVerifier\, \signInWithPhoneNumber\ |
| \/forgot-password\ | \pp/forgot-password/page.tsx\ | Request password reset email | — |
| \/reset-password\ | \pp/reset-password/page.tsx\ | Set new password via token from email | \useSearchParams\ for token/email |
| \/datenschutz\ | \pp/datenschutz/page.tsx\ | GDPR privacy policy (template with placeholders) | — |
| \/impressum\ | \pp/impressum/page.tsx\ | German legal notice (template with placeholders) | — |
| \/error\ | \pp/error.tsx\ | Global error boundary with retry | — |
| \/not-found\ | \pp/not-found.tsx\ | 404 page | — |

### Admin Pages (\pp/admin/\)

| Route | File | Description | Key Components |
|-------|------|-------------|----------------|
| \/admin\ | \pp/admin/page.tsx\ | Reservations table (list, edit, delete, propose time) | \AdminTable\, \NewReservationAlert\ |
| \/admin/calendar\ | \pp/admin/calendar/page.tsx\ | Weekly calendar view with reservations | \CalendarView\ |
| \/admin/history\ | \pp/admin/history/page.tsx\ | Past reservations (last 200) | — |
| \/admin/menu\ | \pp/admin/menu/page.tsx\ | Full menu editor (categories + items) | \MenuEditor\ |
| \/admin/menu/calendar\ | \pp/admin/menu/calendar/page.tsx\ | Same calendar view (alt nav) | \CalendarView\ |
| \/admin/test-dashboard\ | \pp/admin/test-dashboard/page.tsx\ | **In-browser E2E test runner** for reservation APIs | Custom test suite |

### Shared Layout & Providers

| File | Purpose |
|------|---------|
| \pp/layout.tsx\ | Root layout (fonts, metadata, Providers wrapper) |
| \pp/providers.tsx\ | \SessionProvider\ + \ConsentProvider\ + \CookieConsentBanner\ |
| \middleware.ts\ | Protects \/admin/*\ — redirects non-admins to \/login\ |

### Components (\components/\)

| Component | File | Purpose |
|-----------|------|---------|
| \ReservationForm\ | \components/ReservationForm.tsx\ | Public booking form (POST \/api/reservations\) |
| \MenuSection\ | \components/MenuSection.tsx\ | Dynamic menu tabs (fetches \/api/menu\) |
| \MapEmbed\ | \components/MapEmbed.tsx\ | Consent-gated Google Maps iframe |
| \Logo\ | \components/Logo.tsx\ | SVG logo with gradient text |
| \CookieConsentBanner\ | \components/CookieConsentBanner.tsx\ | Essential / All consent buttons |
| \NewReservationAlert\ | \components/admin/NewReservationAlert.tsx\ | Admin toast + desktop notifications (polls \/api/admin/notifications\) |
| \AdminTable\ | \pp/admin/AdminTable.tsx\ | Interactive reservations table (inline edit, propose time, delete) |
| \CalendarView\ | \pp/admin/calendar/CalendarView.tsx\ | Weekly calendar grid with day drill-down |
| \MenuEditor\ | \pp/admin/menu/MenuEditor.tsx\ | Admin CRUD for categories & items |

---

## 4. Lib Utilities (\lib/\)

| File | Exports | Purpose |
|------|---------|---------|
| \uth.ts\ | \handlers, auth, signIn, signOut\ | NextAuth v5 config (Credentials, Google, Facebook, PrismaAdapter, JWT sessions, role callback) |
| \prisma.ts\ | \prisma\ | Singleton PrismaClient (dev hot-reload safe) |
| \mailer.ts\ | \sendMail\, \otpEmailHtml\, \esetPasswordHtml\, \eservationUserHtml\, \eservationAdminHtml\, \eservationConfirmedHtml\, \eservationCancelledHtml\, \eservationChangeRequestHtml\ | Resend email sender + HTML templates (graceful degradation if \RESEND_API_KEY\ missing) |
| \sms.ts\ | \sendSms\ | Twilio transactional SMS (confirmations, cancellations, time changes) — no-op if not configured |
| \otp.ts\ | \generateOtp()\, \otpExpiry(minutes)\ | 6-digit numeric OTP + expiry Date |
| \ateLimit.ts\ | \ateLimit(kind, key)\ | Upstash Redis sliding window: \egister\(5/hr), \login\(10/10min), \otp\(5/10min) — **throws in production if unconfigured** |
| \hash.ts\ | \sha256(value)\ | SHA-256 hex digest (for OTP/token storage) |
| \irebaseClient.ts\ | \irebaseApp\, \irebaseAuth\ | Client SDK init (phone OTP + reCAPTCHA) |
| \irebaseAdmin.ts\ | \getFirebaseAdminAuth()\ | Admin SDK init (verify ID tokens server-side) |
| \disposableEmail.ts\ | \isDisposableEmail(email)\ | Blocks disposable domains + MX record check |
| \consent.tsx\ | \ConsentProvider\, \useConsent\, \ConsentState\ | Client-side cookie consent state (localStorage + \useSyncExternalStore\) |
| \menuData.ts\ | \menuCategories[]\, \estaurantInfo\ | Static menu content + restaurant metadata (address, phone, hours, Maps URLs) |

---

## 5. Environment Variables (from \.env.example\ + \.env\)

### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| \DATABASE_URL\ | PostgreSQL connection string (Neon, etc.) | \postgresql://...\ |
| \AUTH_SECRET\ | NextAuth session encryption key (\
px auth secret\) | \97d1f...\ |
| \NEXTAUTH_URL\ | Canonical site URL (production domain) | \https://karmel-restaurant.vercel.app\ |

### Optional Auth Providers

| Variable | Description |
|----------|-------------|
| \GOOGLE_CLIENT_ID\, \GOOGLE_CLIENT_SECRET\ | Google OAuth |
| \FACEBOOK_CLIENT_ID\, \FACEBOOK_CLIENT_SECRET\ | Facebook OAuth |

### Email (Resend) — **Required for emails to send**

| Variable | Description |
|----------|-------------|
| \RESEND_API_KEY\ | Resend API key |
| \EMAIL_FROM\ | Sender address (verified domain required for production) |
| \ADMIN_EMAIL\ | Restaurant owner inbox for new-reservation alerts |

### Firebase Phone Auth — **Required for phone verification**

**Client (public):**
- \NEXT_PUBLIC_FIREBASE_API_KEY\
- \NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN\
- \NEXT_PUBLIC_FIREBASE_PROJECT_ID\
- \NEXT_PUBLIC_FIREBASE_APP_ID\

**Admin (server-only):**
- \FIREBASE_PROJECT_ID\
- \FIREBASE_CLIENT_EMAIL\
- \FIREBASE_PRIVATE_KEY\ (with literal \\\n\ sequences)

### Rate Limiting (Upstash Redis) — **REQUIRED in production**

| Variable | Description |
|----------|-------------|
| \UPSTASH_REDIS_REST_URL\ | Upstash Redis REST endpoint |
| \UPSTASH_REDIS_REST_TOKEN\ | Upstash Redis token |

### Cron / GDPR Cleanup

| Variable | Default | Description |
|----------|---------|-------------|
| \CRON_SECRET\ | (required) | Bearer token for \/api/cron/cleanup\ (Vercel Cron sends automatically) |
| \UNVERIFIED_ACCOUNT_RETENTION_DAYS\ | \7\ | Days before unverified account deletion |
| \RESERVATION_RETENTION_MONTHS\ | \24\ | Months before reservation deletion |

### SMS (Twilio) — Optional

| Variable | Description |
|----------|-------------|
| \TWILIO_ACCOUNT_SID\ | Twilio account SID |
| \TWILIO_AUTH_TOKEN\ | Twilio auth token |
| \TWILIO_SMS_FROM_NUMBER\ | Verified sender number (E.164) |

---

## 6. Third-Party Integrations

| Service | Purpose | SDK / API | Configuration |
|---------|---------|-----------|---------------|
| **Neon / PostgreSQL** | Primary database | Prisma ORM | \DATABASE_URL\ |
| **NextAuth.js v5** | Authentication (credentials + OAuth) | \@auth/prisma-adapter\, \
ext-auth\ | \AUTH_SECRET\, OAuth credentials |
| **Google OAuth** | Social login | \
ext-auth/providers/google\ | \GOOGLE_CLIENT_ID/SECRET\ |
| **Facebook OAuth** | Social login | \
ext-auth/providers/facebook\ | \FACEBOOK_CLIENT_ID/SECRET\ |
| **Resend** | Transactional email (OTP, reservations, password reset) | \esend\ npm | \RESEND_API_KEY\, \EMAIL_FROM\ |
| **Firebase Authentication** | Phone number OTP verification (client + admin) | \irebase\, \irebase-admin\ | 7 env vars (see above) |
| **Upstash Redis** | Rate limiting (sliding window) | \@upstash/redis\, \@upstash/ratelimit\ | \UPSTASH_REDIS_REST_URL/TOKEN\ |
| **Twilio** | Transactional SMS (reservation confirmations, changes) | \	wilio\ npm | \TWILIO_ACCOUNT_SID/TOKEN/FROM\ |
| **Vercel** | Hosting, Cron jobs, Edge functions | Platform | \ercel.json\ cron schedule |
| **Unsplash** | Hero/background images (external CDN) | \
ext/image\ remotePatterns | Configured in \
ext.config.ts\ |
| **Google Fonts** | Playfair Display, Montserrat, Geist | \
ext/font/google\ | Self-hosted via Next.js |
| **Google Maps** | Location embed (consent-gated) | Iframe embed | \estaurantInfo.mapsEmbedUrl\ |
| **disposable-email-domains** | Blocklist for temp email domains | \disposable-email-domains\ npm | Built-in list + MX check |
| **date-fns** | Date formatting/manipulation | \date-fns\ npm | Calendar, history views |
| **framer-motion** | Animations (hero, menu, calendar) | \ramer-motion\ npm | Throughout UI |
| **zod** | Runtime schema validation | \zod\ npm | All API route inputs |
| **bcryptjs** | Password hashing (cost 12) | \cryptjs\ npm | Register, login, reset |

---

## 7. Security & Compliance Features

### Implemented
- **Rate limiting** on all auth/reservation endpoints (Upstash, production-enforced)
- **Disposable email blocking** (blocklist + MX validation)
- **Password hashing**: bcrypt cost 12
- **OTP/token hashing**: SHA-256 (never stored in plaintext)
- **CSRF protection**: NextAuth v5 JWT sessions with SameSite cookies
- **XSS protection**: React auto-escaping, no \dangerouslySetInnerHTML\ in user content
- **SQL injection protection**: Prisma parameterized queries
- **Cookie consent**: Granular (Essential / All), Google Maps blocked until consent
- **GDPR cleanup cron**: Daily deletion of unverified accounts (7d) + old reservations (24m)
- **Security headers**: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP (via \
ext.config.ts\)
- **Admin route protection**: Middleware + server-side role checks

### Gaps (per GDPR_COMPLIANCE_REPORT.md)
- No user-facing "Delete Account" / "Export Data" (Art. 17, 20)
- No profile page for rectification (Art. 16)
- No "Cookie Settings" reopen UI (TTDSG §25 withdrawal)
- No ROPA (Verarbeitungsverzeichnis, Art. 30)
- AVVs with processors not yet verified
- International transfer mechanisms (DPF/SCCs) not documented per provider

---

## 8. Test Coverage (Existing)

| Test File | Coverage |
|-----------|----------|
| \	ests/rateLimit.test.ts\ | Rate limiter allows requests when Upstash unconfigured (dev) |
| \	ests/otp.test.ts\ | \generateOtp()\ format + \otpExpiry()\ timing |
| \	ests/mailer.test.ts\ | HTML escaping in email templates (XSS prevention) |
| \	ests/mailer-not-configured.test.ts\ | \sendMail\ graceful degradation without \RESEND_API_KEY\ |
| \	ests/hash.test.ts\ | \sha256()\ determinism, length, collision resistance |
| \	ests/cron-cleanup.test.ts\ | Cron endpoint auth (401 without/mismatched \CRON_SECRET\) |

### In-Browser Test Dashboard
\/admin/test-dashboard\ — Interactive test runner covering:
- Reservation creation (valid, invalid email, missing fields, duplicate table, rate limit)
- Reservation updates (status, table, notes, invalid status)
- Reservation deletion (exist, non-existent)
- Change requests (propose, accept, decline)
- Admin auth (list, guest forbidden)

---

## 9. Key Business Logic Flows

### User Registration
1. POST \/api/register\ → validate (Zod) → check disposable email → check existing email/phone
2. Hash password (bcrypt 12) → generate email OTP → create User (unverified)
3. Send OTP email via Resend → return \userId\
4. User enters OTP → POST \/api/verify-email\ → verify hash + expiry → mark \emailVerified\
5. User enters phone → Firebase client sends SMS → user enters code → POST \/api/verify-phone\ → verify ID token → mark \phoneVerified\

### Reservation Creation (Guest or User)
1. POST \/api/reservations\ → validate (Zod) → rate limit
2. Create Reservation (links \userId\ if session exists)
3. Send confirmation email to guest + notification to \ADMIN_EMAIL\
4. Return reservation ID

### Admin Reservation Management
- **List**: GET \/api/reservations\ (admin only)
- **Update**: PATCH \/api/reservations/[id]\ → status/table/notes/change request
  - On \CONFIRMED\: email + SMS to guest
  - On \CANCELLED\: email + SMS to guest
  - On \CHANGE_REQUESTED\ + \equestedTime\: generate \esponseToken\, email + SMS with accept/decline links
- **Delete**: DELETE \/api/reservations/[id]\
- **Customer Response**: GET \/api/reservations/respond?token=...&action=accept|decline\ → updates reservation, notifies admin

### Password Reset
1. POST \/api/forgot-password\ → generate 32-byte hex token → hash + store (30 min expiry) → email link
2. User clicks link → \/reset-password?token=...&email=...\ → POST \/api/reset-password\ → verify hash + expiry → bcrypt new password → clear tokens

### GDPR Cleanup Cron (Daily 03:00 UTC)
1. GET \/api/cron/cleanup\ with \Authorization: Bearer CRON_SECRET\
2. Delete Users where \emailVerified == null\ AND \createdAt < now() - 7d\
3. Delete Reservations where \date < now() - 24 months\
4. Return counts

---

## 10. File Structure Summary

\\\
African-Restaurant/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── register/route.ts
│   │   ├── verify-email/route.ts
│   │   ├── resend-otp/route.ts
│   │   ├── forgot-password/route.ts
│   │   ├── reset-password/route.ts
│   │   ├── verify-phone/route.ts
│   │   ├── reservations/
│   │   │   ├── route.ts (POST/GET)
│   │   │   ├── [id]/route.ts (PATCH/DELETE)
│   │   │   └── respond/route.ts (GET)
│   │   ├── menu/route.ts (GET)
│   │   ├── admin/
│   │   │   ├── menu/route.ts (GET/POST)
│   │   │   ├── menu/[id]/route.ts (PATCH/DELETE) — *directory exists, no route.ts*
│   │   │   ├── menu-categories/route.ts (POST)
│   │   │   ├── menu-categories/[id]/route.ts (DELETE) — *directory exists, no route.ts*
│   │   │   └── notifications/route.ts (GET)
│   │   └── cron/cleanup/route.ts (GET)
│   ├── admin/
│   │   ├── page.tsx (reservations table)
│   │   ├── layout.tsx (auth guard + nav + alerts)
│   │   ├── AdminTable.tsx
│   │   ├── calendar/page.tsx + CalendarView.tsx
│   │   ├── history/page.tsx
│   │   ├── menu/page.tsx + MenuEditor.tsx
│   │   ├── menu/calendar/page.tsx
│   │   └── test-dashboard/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── datenschutz/page.tsx
│   ├── impressum/page.tsx
│   ├── page.tsx (homepage)
│   ├── layout.tsx
│   ├── providers.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ReservationForm.tsx
│   ├── MenuSection.tsx
│   ├── MapEmbed.tsx
│   ├── Logo.tsx
│   ├── CookieConsentBanner.tsx
│   └── admin/
│       └── NewReservationAlert.tsx
├── lib/
│   ├── auth.ts
│   ├── prisma.ts
│   ├── mailer.ts
│   ├── sms.ts
│   ├── otp.ts
│   ├── rateLimit.ts
│   ├── hash.ts
│   ├── firebaseClient.ts
│   ├── firebaseAdmin.ts
│   ├── disposableEmail.ts
│   ├── consent.tsx
│   └── menuData.ts
├── prisma/
│   └── schema.prisma
├── tests/
│   ├── rateLimit.test.ts
│   ├── otp.test.ts
│   ├── mailer.test.ts
│   ├── mailer-not-configured.test.ts
│   ├── hash.test.ts
│   └── cron-cleanup.test.ts
├── scripts/
│   └── make-admin.mjs
├── types/
│   ├── next-auth.d.ts
│   └── bcryptjs.d.ts
├── .env.example
├── .env (populated)
├── vercel.json (cron schedule)
├── next.config.ts (CSP, headers, images)
├── middleware.ts (admin guard)
├── DEPLOYMENT.md
├── GDPR_COMPLIANCE_REPORT.md
├── README.md
└── package.json
\\\

---

## 11. Recommended Test Suite Additions

Based on this audit, a comprehensive test suite should cover:

### Unit Tests (lib/)
- [ ] \uth.ts\ — credential authorize, OAuth signIn callback, JWT/session callbacks
- [ ] \prisma.ts\ — singleton behavior
- [ ] \mailer.ts\ — all HTML templates, \sendMail\ success/error paths
- [ ] \sms.ts\ — Twilio configured/unconfigured paths
- [ ] \otp.ts\ — edge cases (boundaries)
- [ ] \ateLimit.ts\ — each limiter kind, key isolation, Upstash failure modes
- [ ] \hash.ts\ — SHA-256 properties
- [ ] \irebaseAdmin.ts\ — init error handling, token verification
- [ ] \disposableEmail.ts\ — blocklist hits, MX pass/fail, caching
- [ ] \consent.tsx\ — state transitions, localStorage sync, SSR snapshot
- [ ] \menuData.ts\ — data structure integrity

### API Integration Tests
- [ ] \/api/register\ — valid, duplicate email/phone, disposable email, rate limit
- [ ] \/api/verify-email\ — valid, expired, wrong code, missing OTP
- [ ] \/api/resend-otp\ — unverified user, already verified, rate limit
- [ ] \/api/forgot-password\ — unknown email (no leak), known email, rate limit
- [ ] \/api/reset-password\ — valid, expired, wrong token, short password
- [ ] \/api/verify-phone\ — valid ID token, mismatch, invalid token, Firebase unconfigured
- [ ] \/api/reservations\ POST — valid, invalid data, rate limit, consent required
- [ ] \/api/reservations\ GET — admin success, non-admin 403
- [ ] \/api/reservations/[id]\ PATCH — status transitions, table conflict (P2002), change request flow
- [ ] \/api/reservations/[id]\ DELETE — admin success, non-admin 403, not found
- [ ] \/api/reservations/respond\ — accept, decline, invalid/used token
- [ ] \/api/menu\ GET — structure, ordering, availability filter
- [ ] \/api/admin/menu\ CRUD — create, update, delete items/categories
- [ ] \/api/admin/notifications\ — since parameter, serverTime response
- [ ] \/api/cron/cleanup\ — auth, deletion counts

### E2E / Component Tests
- [ ] Registration flow (form → email OTP → phone OTP → sign in)
- [ ] Login flow (credentials, Google, Facebook)
- [ ] Password reset flow
- [ ] Reservation form submission (guest + logged-in)
- [ ] Admin dashboard: table edit, calendar navigation, change request propose/accept/decline
- [ ] Menu editor: add/edit/delete categories & items
- [ ] Cookie consent: banner show/hide, essential vs all, MapEmbed gating
- [ ] Mobile nav, scroll spy, hero parallax

---

## 12. Scripts & Operational Commands

| Command | Purpose |
|---------|---------|
| \
pm run dev\ | Start dev server |
| \
pm run build\ | \prisma generate\ + \
ext build\ |
| \
pm run start\ | Production server |
| \
pm run lint\ | ESLint |
| \
pm run test\ | Vitest unit tests |
| \
pm run db:push\ | Push schema to database |
| \
pm run make-admin -- <email>\ | Promote user to ADMIN |
| \
px auth secret\ | Generate \AUTH_SECRET\ |
| \openssl rand -hex 32\ | Generate \CRON_SECRET\ |

---

*End of Audit Report*
