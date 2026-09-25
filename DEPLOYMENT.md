# Deployment & API Setup Guide — Karmel Café & Restaurant

Do these in order. Every value you collect goes into `.env` locally and into
**Vercel → Project → Settings → Environment Variables** before deploying.

## 1. Database — Neon Postgres (free tier works)
1. Go to https://neon.tech → sign up → "Create a project".
2. Click **Connect** and copy the connection string (starts with `postgresql://`).
   The **pooled** one (host contains `-pooler`) goes into `DATABASE_URL` for the app.
3. Create the tables with the **direct** string (turn "Connection pooling" off),
   given in the command itself so it can't hit the wrong database:
   `DATABASE_URL="<direct string>" npx prisma db push`
   (Command Prompt: `set "DATABASE_URL=<direct string>"` first; PowerShell: `$env:DATABASE_URL="..."`).
   On a new empty database it should report "in sync"; if Prisma warns about
   data loss, stop — you are pointed at a database that already has data.

## 2. Auth.js secret
1. Run: `npx auth secret` (or `openssl rand -base64 32`).
2. Put the output in `AUTH_SECRET`.
3. Set `NEXTAUTH_URL` to `http://localhost:3000` locally, and to your real
   domain (e.g. `https://karmel-restaurant.vercel.app`) in Vercel.

## 3. Google Login
1. Go to https://console.cloud.google.com → create a project.
2. "APIs & Services" → "OAuth consent screen" → set up (External, add app name/logo/support email).
3. "Credentials" → "Create Credentials" → "OAuth client ID" → type: Web application.
4. Authorized redirect URI:
   - Local: `http://localhost:3000/api/auth/callback/google`
   - Prod: `https://YOUR-DOMAIN/api/auth/callback/google`
5. Copy Client ID / Client Secret into `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

## 4. Facebook Login
1. Go to https://developers.facebook.com/apps → "Create App" → type: Consumer.
2. Add product "Facebook Login" → Settings → Valid OAuth Redirect URIs:
   - Local: `http://localhost:3000/api/auth/callback/facebook`
   - Prod: `https://YOUR-DOMAIN/api/auth/callback/facebook`
3. Settings → Basic → copy App ID / App Secret into `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET`.
4. Switch the app from "Development" to "Live" mode once ready for real users.

## 5. Gmail — email (verification codes, password reset, reservation confirmations)
The app sends email through Gmail's SMTP server (Nodemailer, `lib/mailer.ts`).
1. Use the Google account that should send the site's emails.
2. Turn on **2-Step Verification** for it (myaccount.google.com → Security).
   App Passwords require it, and a Google Workspace admin can disable them.
3. Create an **App Password** at https://myaccount.google.com/apppasswords
   (name it e.g. "Karmel website") and copy the 16 characters.
4. Set `GMAIL_USER` (the full address), `GMAIL_APP_PASSWORD` (the 16 characters,
   no spaces) and `EMAIL_FROM` (e.g. `Karmel Café & Restaurant <address@gmail.com>`).
   Gmail normally replaces the From address with `GMAIL_USER`, so the sender
   customers see is that account, and replies go to it.
5. Set `ADMIN_EMAIL` to the restaurant owner's inbox — this is where every new
   reservation notification (name, email, phone, day, date, time, guests) is sent.
6. A free Gmail account can send to roughly 500 recipients per day (Google sets
   the exact limit). That is plenty for a restaurant but not for newsletters.
   If the credentials are missing the app keeps running and logs
   `email NOT sent`, so check the logs if mails don't arrive.

## 6. Firebase — phone number OTP verification
Phone OTP is handled by Firebase Authentication (client SDK sends the SMS via
Firebase's own reCAPTCHA-gated flow; the server verifies the resulting ID
token with the Firebase Admin SDK). You need both a client config and an
Admin SDK service account.
1. Go to https://console.firebase.google.com → "Add project".
2. Build → Authentication → "Get started" → enable the **Phone** sign-in provider.
3. Project Settings (gear icon) → General → "Your apps" → add a Web app →
   copy the config values into `NEXT_PUBLIC_FIREBASE_API_KEY` /
   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` / `NEXT_PUBLIC_FIREBASE_PROJECT_ID` /
   `NEXT_PUBLIC_FIREBASE_APP_ID`.
4. Project Settings → Service Accounts → "Generate new private key" → downloads
   a JSON file. From it, copy `project_id` → `FIREBASE_PROJECT_ID`,
   `client_email` → `FIREBASE_CLIENT_EMAIL`, and `private_key` →
   `FIREBASE_PRIVATE_KEY` (keep the `\n` sequences exactly as they appear in
   the JSON — the app converts them to real newlines at runtime).
5. On Firebase's free (Spark) plan, phone auth is limited to a small daily
   quota and test numbers; upgrade to Blaze (pay-as-you-go) before real launch
   traffic. If the server-side `FIREBASE_*` variables are missing or wrong in
   production, phone verification returns a clean "temporarily unavailable"
   error instead of crashing the rest of the site — but it should still be
   configured properly before launch.
6. The four `NEXT_PUBLIC_FIREBASE_*` values are baked in at **build time**. If
   `NEXT_PUBLIC_FIREBASE_API_KEY` is missing or malformed, `next build` fails
   while prerendering `/register` with `auth/invalid-api-key`. Set them before
   the first deploy, and redeploy after changing them.

## 7. Upstash Redis — rate limiting (set before going live)
1. Go to https://upstash.com → sign up → "Create Database" (Redis, an EU region, free tier).
2. Copy "REST URL" and "REST TOKEN" → `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
   **If these are missing the app still starts, but rate limiting is silently
   switched off**, and it is the only thing standing between the login, OTP and
   registration endpoints and brute-force/abuse. If Upstash rejects the
   credentials, requests are allowed through and a warning is logged. So on a
   live site, always set them and confirm that repeated wrong-password logins
   get blocked after 10 attempts.

## 7b. Data retention cleanup (GDPR)
1. Generate a secret: `openssl rand -hex 32` → put it in `CRON_SECRET`.
2. `vercel.json` already schedules `/api/cron/cleanup` to run daily via Vercel
   Cron; Vercel automatically sends `CRON_SECRET` as the request's Bearer
   token, so no extra setup is needed once the env var is set.
3. This deletes unverified accounts older than `UNVERIFIED_ACCOUNT_RETENTION_DAYS`
   (default 7) and reservations older than `RESERVATION_RETENTION_MONTHS`
   (default 24) — adjust both in your environment variables if you need a
   different retention policy.

## 7c. Legal pages — REQUIRED before going live in Germany
`/impressum` and `/datenschutz` exist as templates with `[bracketed
placeholders]` for your real business details. They read these variables (see
`.env.example` for defaults): `OPERATOR_NAME`, `CONTENT_RESPONSIBLE`,
`COMMERCIAL_REGISTER`, `VAT_ID`, `CONTACT_EMAIL`, `HOSTING_PROVIDER`,
`DATABASE_PROVIDER`, `LOG_RETENTION_DAYS` and
`PARTICIPATES_IN_DISPUTE_RESOLUTION` (must be exactly `true` to switch on),
plus the retention periods above. Fill these in — and ideally have them checked by a
German lawyer or a service like eRecht24/Trusted Shops — before the site is
publicly reachable. An incomplete or missing Impressum is a common target for
German cease-and-desist letters (*Abmahnungen*), independent of any GDPR fine
risk.

## 7d. Translations — DeepL
The language switcher translates the German UI text with DeepL (`/api/translate-ui`)
and caches each language in the database (`Translation` table).
1. Create an API key at https://www.deepl.com/pro-api (the free plan works; free keys end in `:fx`).
2. Put it in `DEEPL_API_KEY`. Without it, choosing a non-German language falls back to German.
3. Set `INTERNAL_API_SECRET` (`openssl rand -hex 32`). It protects `/api/translate`,
   which the site itself never calls; only an admin session or this secret can use it.
4. The German text is the only source that is ever translated. If you edit it in
   `lib/translations.ts`, clear the cache so other languages pick up the change:
   `DELETE FROM "Translation";` (they are rebuilt on the next visit).

## 7e. SMS — Twilio (optional)
Reservation confirmations, cancellations and time-change requests can also be
texted. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` and `TWILIO_SMS_FROM_NUMBER`.
If any is missing, texts are skipped and a line is logged; nothing else changes.
(Login phone verification uses Firebase, not Twilio.)

## 8. First admin account
There's no public "become admin" button (by design). After you register your
own account normally on the live site:
```
npx dotenv -e .env -- npm run make-admin -- you@yourdomain.com
```
(or run `node scripts/make-admin.mjs you@yourdomain.com` with `DATABASE_URL` set in your shell).
This flips your `role` to `ADMIN`, unlocking `/admin`.

## 9. Deploy to Vercel
1. Push this repo to GitHub.
2. https://vercel.com → "Add New Project" → import the repo.
3. In "Environment Variables", paste every key from `.env.example` (in the repo
   root) with your real values (use your production `NEXTAUTH_URL`, e.g.
   `https://your-project.vercel.app`).
4. Deploy. Vercel runs `prisma generate` automatically via the `postinstall` script.
5. After the first deploy, run `npx prisma db push` once (locally, pointed at the
   same `DATABASE_URL`) to make sure the production database has all tables.
6. Re-check the Google/Facebook redirect URIs match your final production domain.

## Notes on the anti-abuse ("fake email") system
- Registration rejects any email whose domain is in the maintained
  `disposable-email-domains` blocklist, and separately rejects domains with no
  mail server (MX record) at all — this catches most throwaway/temp-mail sites,
  including new ones not yet in any blocklist.
- Only **email** verification gates login (`lib/auth.ts`'s credentials
  `authorize()`). Phone verification (Firebase) is collected during
  registration but is not currently required to log in — a user can complete
  email verification and sign in without ever finishing the phone-OTP step.
- Registration, login, and OTP endpoints are all rate-limited per IP/email via
  Upstash so scripted signup/brute-force attempts get throttled automatically
  (only while the Upstash variables are set — see §7).
