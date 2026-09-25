# Handover / migration checklist: move every service to the client's own accounts

Working document. It lists **names of settings only, never values**. Generated from the code on
`main` (2026-09-25), not from the older `DEPLOYMENT.md`, which still describes Resend.

## 0. Findings that shape the plan

Read-only counts on the current production database (no personal data read):

| Fact | Consequence |
|---|---|
| 19 users: **18 USER + 1 ADMIN** | The single admin is the account to replace or supplement. |
| The 1 admin is the **only** OAuth-linked user (Google). **0 Facebook accounts.** | Facebook's per-app user IDs are not a problem for existing users. Google IDs are the same across OAuth clients, so the admin's link should survive a new Google client (verify on first login). |
| **18 of 19 users have never verified their email** (all password signups) | They cannot log in and the nightly cleanup deletes such accounts after 7 days. Likely test signups, or people whose verification email never arrived. **Don't migrate them.** |
| 8 reservations, 18 menu categories, 70 menu items | The data actually worth moving. |
| 10 cached translations, scanned: only `<p> <ul> <li> <strong>`, no script/event patterns | Clean. Safe to leave `Translation` out of the copy; it rebuilds itself. |

Things in the repo that are out of date:
- Email now goes through **Gmail SMTP (nodemailer)**. `DEPLOYMENT.md`, `README.md` and the `resend` package are stale.
- 15 variables the code reads are **missing from `.env.example`** (section 3).
- `kontakt@karmel-restaurant.de` is hard-coded in `lib/translations.ts` (2 places), `app/impressum/page.tsx` and `app/datenschutz/DatenschutzContent.tsx`. It only works if the client owns that domain's mailbox.

## 1. Decisions needed before starting

- [ ] **Vercel: whose account is the project under today?** The repo belongs to `rickmaity07-maker`; a transfer must be started by an **Owner of the current Vercel team** (section 2.1). Owner = ______
- [ ] **Domain**: who owns `karmel-restaurant.*`, where is its DNS, was it bought through Vercel? Final production URL = ______
- [ ] **Hosting plan**: Vercel's Hobby plan is limited to non-commercial, personal use (fair-use guidelines) and has no team collaboration. A business site belongs on a paid **Pro team** owned by the client.
- [ ] **Data**: migrate reservations + menu + admin only (recommended) or everything?
- [ ] **Who is the admin** after handover (client's Google account)? ______
- [ ] **Legal details** for Impressum/Datenschutz (section 5) supplied by the client.
- [ ] **SMS** (Twilio): keep reservation texts or drop them? Currently inactive unless configured.
- [ ] **Facebook login**: keep it? 0 users use it, and it needs a Facebook app + review.

## 2. Accounts to create under the client's Gmail

Give the client **Owner** access and make sure they hold recovery + 2FA for each.

### 2.1 Vercel (do this FIRST, it keeps the live site running)
Why first: a transfer moves the project **with zero downtime** and copies its settings, so the site
keeps running on today's services while you swap them one by one afterwards (sections 2.3-2.9).

**Client side**
- [ ] Sign up at vercel.com with the client's Gmail; create a **Pro team** (e.g. `karmel-restaurant`) and add a **payment method** (Vercel requires a valid one on the destination team before a transfer).
- [ ] Confirm the current plan/seat price on vercel.com/pricing (each Developer seat is billed while a member).

**Before you transfer (current owner)**
- [ ] Check **Settings → Integrations** on the project: if the database or Redis was created through a Vercel marketplace integration, it is **not** transferred and must be re-added.
- [ ] Note the production URL. If it is a `*.vercel.app` address, keep the **same project name** so it survives (OAuth redirect URIs and `NEXTAUTH_URL` depend on it).
- [ ] Any variables defined in `vercel.json` `env`/`build.env` are NOT copied (this repo's `vercel.json` only has the cron, so nothing to do).

**Transfer: pick ONE path** (both zero-downtime)
- **A. Membership path (dashboard).** Rule: you must be an **Owner of the source team** and a **member of the destination team**. The client invites the current owner into the Pro team as a Member; then on the project: **Settings → General → Transfer Project → Transfer**, choose the client's team, review the list of domains and environment variables, confirm. Takes 10 seconds to 10 minutes; the original project is hidden, nothing is copied twice. Remove yourself from the team afterwards.
- **B. Request/accept path (no membership).** The current owner creates a transfer request with an access token (vercel.com/account/tokens):
  `curl -X POST "https://api.vercel.com/projects/<project-name>/transfer-request?teamId=<source-team-id>" -H "Authorization: Bearer <TOKEN>"` → returns a `code` valid **24 hours**. The client, logged in to their team, opens `https://vercel.com/claim-deployment?code=<code>` and accepts. (Vercel's docs don't state a membership requirement for this path; if it is refused, use path A.) Delete the token afterwards.

**After the transfer, verify in the client's team**
- [ ] Project appears in the client's team; latest production deployment is live and the site loads.
- [ ] **Settings → Domains**: every domain shows valid configuration. Domains bought through Vercel move (and are billed to) the new team; a root domain on an external registrar just keeps its DNS.
- [ ] **Settings → Environment Variables**: all present for Production/Preview as before. (They are the OLD secrets; they get replaced in 2.2-2.9.)
- [ ] **Settings → Cron Jobs**: `/api/cron/cleanup` (daily 03:00) is listed and `CRON_SECRET` is set.
- [ ] **Settings → Git**: still connected. If the GitHub repo also moves to the client (2.2), install the Vercel GitHub App on the client's GitHub account, reconnect the repo, then push a trivial commit and confirm a deployment starts.
- [ ] Re-add any marketplace integrations; usage and log history reset by design.

**Cleanup**
- [ ] Remove the previous owner/developer from the team (or downgrade to Viewer), revoke any API token used, and remove the Vercel GitHub App from the old GitHub account once nothing depends on it.

### 2.2 GitHub
- [ ] Transfer repo `rickmaity07-maker/karmel-restaurant` to the client's account/org (or add the client as owner).
- [ ] Update local remotes: `git remote set-url origin <new url>`.
- [ ] Reconnect Vercel's Git integration (see 2.1).

### 2.3 Neon (Postgres)
- [ ] Sign up with the client's Gmail; create a project in **Frankfurt (`aws-eu-central-1`)** (same region as today: EU data).
- [ ] Copy the **direct** connection string (pooling off) for migrations; the pooled one is fine for the app.
- [ ] `npx prisma db push` against the **new** empty DB (creates all tables, incl. menu + translation).
- [ ] Copy data (see section 4).
- [ ] Old database: delete only after the go-live checks pass and a backup exists.

### 2.4 Email: Gmail SMTP (nodemailer)
The mailer needs `GMAIL_USER` + `GMAIL_APP_PASSWORD`.
- [ ] On the client's Google account: turn on **2-Step Verification**, then create an **App Password**. Workspace admins can disable app passwords.
- [ ] Set `GMAIL_USER` (the address), `GMAIL_APP_PASSWORD` (16-char app password), `ADMIN_EMAIL` (inbox for new-reservation alerts, can be the same).
- [ ] Expect: Gmail normally **rewrites the From address to the authenticated account** (so `EMAIL_FROM` is mostly cosmetic) and has a **daily send limit** (roughly 500 recipients for a free account). Fine for a restaurant; not for bulk mail.
- [ ] Send a test from the deployed site (register, and a reservation) and check it doesn't land in spam.

### 2.5 Google sign-in (OAuth)
- [ ] Google Cloud project under the client's account → OAuth consent screen (External, app name, support email, logo).
- [ ] **Publish the app** ("In production"). In "Testing" mode only listed test users can sign in and tokens expire quickly.
- [ ] Create a Web OAuth client. Authorized redirect URIs: `https://<domain>/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google`.
- [ ] Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

### 2.6 Facebook sign-in (optional, 0 users today)
- [ ] Only if kept: Facebook Developers app under the client's business, redirect URI `https://<domain>/api/auth/callback/facebook`, switch to **Live**. Set `FACEBOOK_CLIENT_ID`, `FACEBOOK_CLIENT_SECRET`. Otherwise leave both empty.

### 2.7 Firebase (phone-number OTP at signup)
Phone verification is collected at signup but **not required to log in**.
- [ ] Firebase project under the client's Google account; enable the **Phone** provider.
- [ ] Add the production domain (and `localhost`) under Authentication → Settings → **Authorized domains**.
- [ ] Web app config → `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_APP_ID`.
- [ ] Service-account key → `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (keep the `\n` sequences).
- [ ] Real SMS beyond test numbers needs the paid (Blaze) plan → client's billing card.

### 2.8 Upstash Redis (rate limiting)
- [ ] Database in an EU region under the client's account → `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`. Nothing to migrate (state is temporary).
- [ ] The app **fails open** if these are missing or wrong, so login/OTP throttling silently turns off. Check it after deploy (section 6).

### 2.9 DeepL and Twilio
- [ ] DeepL: API key from the client's account → `DEEPL_API_KEY` (free keys end in `:fx`). Without it non-German languages return "not configured".
- [ ] Twilio (optional SMS): client's account + sender number → `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM_NUMBER`. Without them SMS is skipped with a log line.

## 3. Environment variables (all of them)

Generate fresh secrets: `AUTH_SECRET` (`openssl rand -base64 32`), `CRON_SECRET` (`openssl rand -hex 32`), `INTERNAL_API_SECRET` (`openssl rand -hex 32`). Changing `AUTH_SECRET` signs everyone out (acceptable). In Vercel, set new values for **Preview** first, test, then update **Production**.

| Group | Variables | Notes |
|---|---|---|
| Core | `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL` | `NEXTAUTH_URL` = final `https://` domain (used in reset and accept/decline links) |
| Email | `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_FROM`, `ADMIN_EMAIL` | |
| Google / Facebook | `GOOGLE_CLIENT_ID/SECRET`, `FACEBOOK_CLIENT_ID/SECRET` | Facebook optional |
| Firebase | `NEXT_PUBLIC_FIREBASE_{API_KEY,AUTH_DOMAIN,PROJECT_ID,APP_ID}`, `FIREBASE_{PROJECT_ID,CLIENT_EMAIL,PRIVATE_KEY}` | |
| Rate limit | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | |
| Cleanup cron | `CRON_SECRET`, `UNVERIFIED_ACCOUNT_RETENTION_DAYS`, `RESERVATION_RETENTION_MONTHS` | defaults 7 days / 24 months |
| Translation | `DEEPL_API_KEY`, `INTERNAL_API_SECRET` | secret protects the unused `/api/translate` route |
| SMS (optional) | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM_NUMBER` | |
| Legal pages | `OPERATOR_NAME`, `CONTENT_RESPONSIBLE`, `COMMERCIAL_REGISTER`, `VAT_ID`, `CONTACT_EMAIL`, `HOSTING_PROVIDER`, `DATABASE_PROVIDER`, `LOG_RETENTION_DAYS`, `PARTICIPATES_IN_DISPUTE_RESOLUTION` | see section 5 |

- [ ] Add the 15 missing variables to `.env.example` (offered, not done).
- [ ] Remove the unused `resend` dependency and update `DEPLOYMENT.md` / `README.md` for Gmail SMTP (offered, not done).

## 4. Data migration (old Neon → new Neon)

- [ ] Take a backup of the old database first (Neon branch/snapshot or `pg_dump`).
- [ ] New DB already has the schema from `prisma db push`.
- [ ] Copy **data only** for: `MenuCategory`, `MenuItem`, `Reservation`, and the **client's admin user**. Use a single dump so foreign-key order is handled (`Reservation.userId` points at `User`; keep the user rows those reservations reference, or accept `userId` = null).
- [ ] **Skip:** the 18 unverified users, `Session` (empty; sessions are JWT), `VerificationToken` (empty), `Translation` (rebuilds itself).
- [ ] Alternative for menu content: `node scripts/seed-menu.mjs` against the new DB.
- [ ] Verify row counts match (expect 8 reservations, 18 categories, 70 items).
- [ ] Promote the client's admin: they sign in once (Google), then `npm run make-admin -- <their-email>` with `DATABASE_URL` pointing at the **new** DB.

## 5. Legal and privacy (Germany), not legal advice

- [ ] Fill in the operator details for `/impressum` and `/datenschutz` (name/legal form, address, register + VAT ID if any, responsible person, contact email). Wrong or placeholder details there are a common cause of warning letters (*Abmahnung*).
- [ ] Replace the hard-coded `kontakt@karmel-restaurant.de` if the client doesn't own that mailbox.
- [ ] Update the hosting/database provider names in the privacy text if they change.
- [ ] Each service is now the **client's** processor: accept the data-processing agreement (AVV/DPA) in the client's own Vercel, Neon, Google/Firebase, Upstash, Twilio accounts.
- [ ] Old copies of personal data (old Neon project, laptop `.env.local`, exports) are deleted once the new stack is live.

## 6. Test on a Preview deployment first, then cut over

Put the new service values in Vercel's **Preview** environment and run these on a preview URL. They are the end-to-end checks still owed from the audit, so this covers both.
- [ ] Register with a real address → verification email arrives (Gmail SMTP) → code works → can log in.
- [ ] Phone OTP step works (Firebase authorized domain set).
- [ ] Google sign-in works; the client's admin can open `/admin` over **HTTPS**.
- [ ] Make a reservation → guest email + `ADMIN_EMAIL` alert arrive; confirm/cancel/time-change from the admin panel sends the right emails; the accept/decline link works.
- [ ] Wrong-password login is blocked after 10 attempts (proves Upstash is really connected).
- [ ] Switch language to two non-German languages (proves DeepL + DB cache); `/datenschutz` renders.
- [ ] Trigger the cron once manually with the `CRON_SECRET` header and confirm it reports 0 unexpected deletions.
- [ ] Unauthenticated `GET /api/reservations` and `/admin` are refused.

Cutover: final data copy → set the new values in **Production** → redeploy → re-run the checks on the real domain → keep the old stack for a few days as rollback → then delete it.

## 7. After cutover

- [ ] Rotate/revoke anything issued to the old owner: old Neon role/project, old Resend key, old Google/Facebook/Firebase/Upstash/DeepL/Twilio keys, old Vercel tokens.
- [ ] Remove the production `DATABASE_URL` from developer machines.
- [ ] Hand the client a short "who owns what and how to renew" page (renewals, billing, where secrets live).
