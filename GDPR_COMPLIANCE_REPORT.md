# GDPR & German Digital Law Compliance Report
## Karmel Café & Restaurant Website

**Generated:** 2026-09-08  
**Scope:** Full audit of `C:\Users\Test\Desktop\Karmel-Restaurant\African-Restaurant`  
**Status:** Pre-production template — placeholders must be filled before go-live

---

## Executive Summary

| Area | Status | Critical Issues |
|------|--------|-----------------|
| **Impressum (§5 DDG)** | ⚠️ Template only — placeholders must be filled | Missing: legal entity name, VAT ID, register court/number, responsible person |
| **Datenschutzerklärung (Art. 12–14 DSGVO)** | ⚠️ Template only — placeholders must be filled | Missing: hosting provider name, retention periods, DB provider, actual contact email |
| **Cookie Consent (TTDSG §25, ePrivacy)** | ✅ Implemented correctly | None — essential vs. optional properly separated |
| **Legal Basis Documentation (Art. 6 DSGVO)** | ✅ Well documented in privacy policy | None |
| **Data Subject Rights (Art. 15–22 DSGVO)** | ✅ Listed in privacy policy | No automated self-service portal (manual process documented) |
| **Data Retention / Storage Limitation (Art. 5(1)(e))** | ✅ Cron job implemented | Retention periods are env-configurable but placeholders in policy |
| **Security (Art. 32 DSGVO)** | ✅ Strong implementation | None |
| **Third-Party Transfers (Art. 28, 44–49 DSGVO)** | ⚠️ AVVs referenced but not verified | Must confirm AVVs with Resend, Upstash, DB provider, Firebase |
| **International Transfers (Art. 44–49 DSGVO)** | ⚠️ US providers used | Must verify EU-US Data Privacy Framework / SCCs per provider |
| **ePrivacy / TTDSG (§25)** | ✅ Consent before non-essential cookies | None |
| **DSGVO Art. 30 (ROPA)** | ❌ Not documented | No Record of Processing Activities maintained |

---

## 1. Impressum (§5 DDG / §18 MStV / §55 RStV) — `app/impressum/page.tsx`

### Current State
The page exists and uses the correct structure, but **all operator details are placeholders**:

```tsx
// Lines 23–50: All bracketed placeholders
<p>[Vollständiger Name des Betreibers/Inhabers bzw. Rechtsform…]</p>
<p>{restaurantInfo.address}</p>  // Only street/city from menuData.ts
<p>E-Mail: [kontakt@ihre-domain.de]</p>
<p>[Umsatzsteuer-Identifikationsnummer…]</p>
<p>[Falls im Handelsregister eingetragen…]</p>
<p>[Name und Anschrift der verantwortlichen Person]</p>
```

### Required Actions (Before Go-Live)
| Field | Requirement | Source |
|-------|-------------|--------|
| **Vollständiger Name / Rechtsform** | Mandatory (§5 DDG) — natural person or legal entity | Trade register / business registration |
| **Anschrift** | Complete postal address (street, house no., postal code, city) | `menuData.ts` has street/city only |
| **Kontakt (E-Mail + Telefon)** | Must be reachable "quickly and directly" — E-Mail mandatory | Add real contact email |
| **Umsatzsteuer-ID (USt-IdNr.)** | If VAT-registered (§27a UStG) — otherwise remove section | Finanzamt |
| **Handelsregister** | If registered (GmbH, UG, AG, e.K., etc.) — register court + number | Handelsregisterauszug |
| **Verantwortlich für Inhalt (§18 MStV)** | Natural person with full name + address | Must match operator |
| **EU-Streitschlichtung (OS-Plattform)** | Link + statement on participation readiness | Current text is correct if not participating |

### Risk Level: **HIGH** — Missing/incomplete Impressum is the #1 cause of German *Abmahnungen* (cease-and-desist letters). Costs: typically €200–1,500 + legal fees.

---

## 2. Datenschutzerklärung (Art. 12–14, 24 DSGVO) — `app/datenschutz/page.tsx`

### Current State
Comprehensive template covering all processing activities. **All provider names, retention periods, and contact details are placeholders.**

### Section-by-Section Analysis

| Section | Status | Missing / To Verify |
|---------|--------|---------------------|
| **1. Verantwortlicher** | ⚠️ Template | Operator legal name, real contact email |
| **2. Übersicht** | ✅ Good structure | — |
| **3. Hosting / Server-Logfiles** | ⚠️ Template | Hosting provider name (Vercel?), exact retention (30 days?) |
| **4. Registrierung & Login** | ✅ Accurate to code | Retention for unverified accounts (7 days — matches cron) |
| **5. Tischreservierung** | ✅ Accurate to code | Retention period (24 months — matches cron env default) |
| **6. Cookies / LocalStorage** | ✅ Correct TTDSG reference | — |
| **7. Firebase / reCAPTCHA** | ✅ Accurate to code | Verify Firebase project location (EU vs US) |
| **8. Google / Facebook Login** | ✅ Accurate to code | — |
| **9. Google Maps** | ✅ Consent-gated (MapEmbed.tsx) | — |
| **10. Auftragsverarbeiter** | ⚠️ Template | **Must list actual providers & confirm AVVs**: Resend, Upstash, DB (Neon?), Firebase |
| **11. Betroffenenrechte** | ✅ Complete + BayLDA reference | — |
| **12. Datensicherheit** | ✅ TLS, bcrypt, hashed OTPs | — |

### Critical Placeholders to Replace
```tsx
// Line 16: "Stand: [Datum einfügen]" → Actual date
// Line 29: "[Vollständiger Name…]" → Legal entity name
// Line 32: "[kontakt@ihre-domain.de]" → Real contact email
// Line 47–48: "[Hosting-Anbieter, z. B. Vercel Inc…]" → Actual host
// Line 54: "[Zeitraum, z. B. 30 Tagen]" → Actual log retention
// Line 74: "[7] Tagen" → Matches UNVERIFIED_ACCOUNT_RETENTION_DAYS (default 7)
// Line 87: "[24 Monaten]" → Matches RESERVATION_RETENTION_MONTHS (default 24)
// Lines 172–182: All AVV providers & transfer mechanisms
```

### Risk Level: **HIGH** — Incomplete privacy policy violates Art. 12–14 DSGVO (transparency). Fines up to €20M / 4% global turnover.

---

## 3. Cookie & Consent Management (TTDSG §25, ePrivacy, Art. 6(1)(a) DSGVO)

### Implementation: `components/CookieConsentBanner.tsx` + `lib/consent.tsx`

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| **Essential cookies exempt from consent** | NextAuth session cookie only (§25 Abs. 2 Nr. 2 TTDSG) | ✅ Correct |
| **Non-essential (Google Maps) requires opt-in** | Maps blocked until "Accept all" | ✅ Correct |
| **Granular choice (Essential / All)** | Two buttons: "Essential only" / "Accept all" | ✅ Correct |
| **No pre-ticked boxes** | User must click | ✅ Correct |
| **Consent stored (localStorage)** | `karmel-cookie-consent` key | ✅ Correct |
| **Revocable anytime** | User can clear browser data — no UI to reopen banner | ⚠️ **Gap** |
| **Link to privacy policy from banner** | Yes (`/datenschutz`) | ✅ Correct |
| **No dark patterns** | Equal prominence buttons | ✅ Correct |

### Gap: **No "Change Consent" / "Reopen Banner" UI**
- Users who clicked "Essential only" cannot later enable Maps without clearing browser data.
- **Fix:** Add a floating "Cookie Settings" link/button (e.g., in footer) that reopens the banner or navigates to a consent management page.

---

## 4. Data Processing Activities — Code vs. Policy Alignment

| Processing Activity | Code Location | Legal Basis (Policy) | Legal Basis (Code) | Match |
|---------------------|---------------|----------------------|---------------------|-------|
| **Account Registration** | `app/api/register/route.ts` | Art. 6(1)(b) + (f) | Consent checkbox + contract | ✅ |
| **Email Verification (OTP)** | `app/api/verify-email/route.ts` | Art. 6(1)(b) + (f) | Part of registration flow | ✅ |
| **Phone Verification (Firebase)** | `app/api/verify-phone/route.ts` | Art. 6(1)(f) | Firebase reCAPTCHA + SMS | ✅ |
| **Login (Credentials)** | `lib/auth.ts` | Art. 6(1)(b) | bcrypt + JWT session | ✅ |
| **Login (Google/Facebook)** | `lib/auth.ts` | Art. 6(1)(b) | OAuth flow | ✅ |
| **Password Reset** | `app/api/forgot-password/route.ts` + `reset-password` | Art. 6(1)(b) | Token + email | ✅ |
| **Tischreservierung** | `app/api/reservations/route.ts` | Art. 6(1)(b) | Consent checkbox + contract | ✅ |
| **Admin Notifications (Email)** | `app/api/reservations/route.ts:64–71` | Art. 6(1)(f) | ADMIN_EMAIL env var | ✅ |
| **Rate Limiting (Upstash)** | `lib/rateLimit.ts` | Art. 6(1)(f) | IP/email stored temporarily | ✅ |
| **Google Maps** | `components/MapEmbed.tsx` | Art. 6(1)(a) | Consent-gated load | ✅ |
| **Analytics / Tracking** | — | — | **None implemented** | ✅ (by absence) |

### Notes
- **No analytics/tracking** (GA, Matomo, etc.) — reduces compliance burden significantly.
- **Firebase reCAPTCHA** loads invisibly during phone verification — policy correctly discloses this.
- **Resend emails** contain personal data (name, email, phone, reservation details) — AVV required.

---

## 5. Third-Party Processors (Art. 28 DSGVO) — AVV Status

| Processor | Purpose | Data Transferred | Location | AVV Required? | Status |
|-----------|---------|------------------|----------|---------------|--------|
| **Vercel (Hosting)** | Hosting, edge logs | IP, request logs | Global (US corp) | ✅ Yes | ⚠️ Verify |
| **Neon / PostgreSQL (DB)** | User + reservation data | All personal data | EU regions available | ✅ Yes | ⚠️ Verify |
| **Resend** | Transactional emails | Name, email, phone, reservation details | US | ✅ Yes | ⚠️ Verify |
| **Upstash (Redis)** | Rate limiting | IP, email (hashed keys) | Global | ✅ Yes | ⚠️ Verify |
| **Firebase Auth (Google)** | Phone OTP + reCAPTCHA | Phone number, IP, device info | EU (Ireland) / US | ✅ Yes | ⚠️ Verify |
| **Google Maps** | Location display | IP (on consent) | US / Global | ✅ Yes (on consent) | ⚠️ Verify |
| **Google OAuth** | Social login | Name, email | EU (Ireland) | ✅ Yes | ⚠️ Verify |
| **Facebook/Meta OAuth** | Social login | Name, email | EU (Ireland) | ✅ Yes | ⚠️ Verify |

### Action Required
1. **Execute AVVs (Auftragsverarbeitungsverträge)** with all above before go-live.
2. **Document transfer mechanisms** for US providers (Resend, Upstash, Firebase, Google, Meta):
   - EU-US Data Privacy Framework (DPF) certification, **or**
   - Standard Contractual Clauses (SCCs) + Transfer Impact Assessment (TIA)
3. **Update Privacy Policy Section 10** with actual provider names and confirmed transfer mechanism.

---

## 6. Data Retention & Deletion (Art. 5(1)(e), 17, 30 DSGVO)

### Implemented: `app/api/cron/cleanup/route.ts` + `vercel.json`

| Data Type | Retention Policy | Code Implementation | Configurable? |
|-----------|------------------|---------------------|---------------|
| **Unverified accounts** | 7 days (default) | `UNVERIFIED_ACCOUNT_RETENTION_DAYS` | ✅ Via env |
| **Verified accounts** | On user request (Art. 17) | Manual — no self-service delete UI | ❌ |
| **Reservations** | 24 months (default) | `RESERVATION_RETENTION_MONTHS` | ✅ Via env |
| **Server logs (hosting)** | 30 days (policy placeholder) | Hosting provider (Vercel) | ⚠️ Verify |
| **Rate-limit data (Upstash)** | Sliding window (1h / 10m) | Auto-expiring Redis keys | ✅ |

### Gaps
| Gap | Risk | Recommendation |
|-----|------|----------------|
| **No user-facing "Delete Account" feature** | Art. 17 (Right to Erasure) — must be "without undue delay" | Add account deletion in user profile or `/datenschutz` contact form |
| **No automated reservation deletion for cancelled bookings** | Retention policy says "after reservation date" — code deletes by date only | Consider deleting cancelled reservations sooner |
| **No ROPA (Verarbeitungsverzeichnis, Art. 30)** | Mandatory for controllers — even small businesses | Create simple spreadsheet documenting all processing activities |

---

## 7. Security Measures (Art. 32 DSGVO)

| Measure | Implementation | Status |
|---------|----------------|--------|
| **TLS/HTTPS** | Vercel enforces HTTPS | ✅ |
| **Password hashing** | bcrypt cost 12 (`lib/hash.ts`, `register/route.ts`) | ✅ Strong |
| **OTP/Token hashing** | SHA-256 (`lib/hash.ts`) | ✅ |
| **Rate limiting** | Upstash Redis sliding window (register, login, OTP) | ✅ Production-enforced |
| **Disposable email blocking** | `disposable-email-domains` + MX check | ✅ Good defense-in-depth |
| **SQL injection protection** | Prisma ORM (parameterized queries) | ✅ |
| **CSRF protection** | NextAuth v5 (JWT sessions, SameSite cookies) | ✅ |
| **XSS protection** | React auto-escaping, no `dangerouslySetInnerHTML` | ✅ |
| **Content Security Policy** | Not explicitly configured | ⚠️ Consider adding via `next.config.ts` headers |
| **Security headers (HSTS, X-Frame, etc.)** | Vercel defaults + `middleware.ts` only for admin | ⚠️ Add comprehensive headers |

### Recommended Security Headers (add to `next.config.ts`)
```ts
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ];
}
```

---

## 8. Data Subject Rights (Art. 15–22 DSGVO) — Implementation Status

| Right | Policy States | Technical Implementation | Gap |
|-------|---------------|--------------------------|-----|
| **Access (Art. 15)** | ✅ Listed | Manual via contact email | No self-service export |
| **Rectification (Art. 16)** | ✅ Listed | User can edit profile? (No profile page exists) | ❌ No profile edit UI |
| **Erasure (Art. 17)** | ✅ Listed | Manual via contact email | No self-service delete |
| **Restriction (Art. 18)** | ✅ Listed | Manual | — |
| **Portability (Art. 20)** | ✅ Listed | Manual (JSON export) | No automated export |
| **Objection (Art. 21)** | ✅ Listed | Manual | — |
| **Withdraw consent (Art. 7(3))** | ✅ Listed | Cookie: clear localStorage; Email/phone: contact admin | Cookie revocation UI missing |

### Recommendation
Build a simple **"My Data" page** (protected route) where logged-in users can:
- View stored data (name, email, phone, reservations)
- Request rectification
- Request deletion (triggers admin review / automated deletion)
- Download JSON export (Art. 20)

---

## 9. International Data Transfers (Art. 44–49 DSGVO)

### Current Providers with Potential US Transfers
| Provider | Likely Transfer | Mechanism to Verify |
|----------|-----------------|---------------------|
| **Resend** | Yes (US corp) | DPF certification or SCCs |
| **Upstash** | Yes (US corp) | DPF certification or SCCs |
| **Firebase (Google)** | Phone auth may route via US | Google Ireland Ltd. (EU) — verify project location |
| **Google Maps / OAuth** | IP to Google servers | Google Ireland Ltd. — DPF certified |
| **Meta (Facebook OAuth)** | IP to Meta servers | Meta Ireland Ltd. — DPF certified |
| **Vercel** | Edge logs may hit US POPs | DPF certified |

### Action
- Confirm each provider's **DPF certification** at: https://www.dataprivacyframework.gov/s/participant-search
- If not DPF-certified: execute **SCCs (2021 version)** + **Transfer Impact Assessment (TIA)**
- Document in ROPA and update Privacy Policy Section 10.

---

## 10. ePrivacy / TTDSG Specifics (German Cookie Law)

| Requirement | Status | Notes |
|-------------|--------|-------|
| **§25 TTDSG: Consent for non-essential cookies** | ✅ Implemented | Google Maps loaded only after consent |
| **§25 TTDSG: Essential cookies exempt** | ✅ Correct | NextAuth session cookie only |
| **§25 TTDSG: Clear & comprehensive information** | ✅ Banner links to privacy policy | — |
| **§25 TTDSG: Freely given, specific, informed** | ✅ Two-button granular choice | — |
| **§25 TTDSG: Easy withdrawal** | ⚠️ Partial | No "reopen banner" UI |
| **Impressum link in footer** | ✅ Present | `app/page.tsx:542` |
| **Datenschutz link in footer** | ✅ Present | `app/page.tsx:544` |

---

## 11. Additional German Law Considerations

| Law | Requirement | Status |
|-----|-------------|--------|
| **§5 DDG (Impressum)** | Complete provider identification | ⚠️ Placeholders only |
| **§18 MStV (Content responsibility)** | Named responsible person | ⚠️ Placeholder |
| **§3a BDSG (Employee data)** | Not applicable (no employee portal) | N/A |
| **TTDSG (Telekommunikation-Telemedien-Datenschutz-Gesetz)** | Cookie consent, metadata protection | ✅ Mostly compliant |
| **UWG (Unfair Competition)** | No misleading advertising, proper pricing | ⚠️ Menu prices in `menuData.ts` — ensure they match actual prices |
| **Preisangabenverordnung (PAngV)** | Prices must include VAT, per unit | ⚠️ Prices shown as "2,00 €" — verify VAT inclusion |
| **Allergenkennzeichnung (LMIV)** | Allergens for food items | ❌ Not implemented in menu data |
| **GewO §33a (Digital services)** | Accessibility (Barrierefreiheit) | ⚠️ No explicit ARIA / contrast audit |

---

## 12. Priority Action Checklist (Before Go-Live)

### 🔴 CRITICAL (Legal Risk: Abmahnung / Fines)
- [ ] **Fill all Impressum placeholders** with verified business data
- [ ] **Fill all Datenschutzerklärung placeholders** (hosting provider, retention periods, contact email, AVV providers)
- [ ] **Execute AVVs** with Resend, Upstash, Database provider, Firebase, Vercel
- [ ] **Verify international transfer mechanisms** (DPF / SCCs) for all US processors
- [ ] **Set real `EMAIL_FROM` domain** (not `onboarding@resend.dev`) — verify domain in Resend
- [ ] **Configure `CRON_SECRET`** and verify Vercel Cron runs daily
- [ ] **Add security headers** (HSTS, CSP, X-Frame-Options, etc.)

### 🟠 HIGH (GDPR Compliance Gaps)
- [ ] **Add "Cookie Settings" link** in footer to reopen consent banner
- [ ] **Implement user-facing "Delete Account" / "Export Data"** (Art. 17, 20)
- [ ] **Create ROPA (Verarbeitungsverzeichnis, Art. 30)** — simple spreadsheet sufficient
- [ ] **Add profile page** for users to rectify data (Art. 16)
- [ ] **Verify Firebase project region** = EU (europe-west1 / europe-west3)
- [ ] **Confirm Upstash Redis region** = EU (if available)

### 🟡 MEDIUM (Best Practice / Risk Reduction)
- [ ] **Add Allergen information** to menu items (LMIV compliance)
- [ ] **Audit accessibility** (WCAG 2.1 AA) — contrast, ARIA labels, keyboard nav
- [ ] **Add CSP header** to mitigate XSS risk
- [ ] **Document incident response plan** (Art. 33/34 DSGVO — 72h breach notification)
- [ ] **Add "Last updated" date** to both legal pages (auto-generate from git commit?)
- [ ] **Translate Impressum to English** (current page mixes German/English)

### 🟢 LOW (Nice to Have)
- [ ] **Consent logging** (timestamp + version) for Art. 7(1) accountability
- [ ] **Automated reservation deletion** for cancelled bookings (shorter retention)
- [ ] **Email unsubscribe links** in transactional emails (not legally required but good UX)

---

## 13. File Reference Map (for your fixes)

| File | Purpose | Key Lines to Edit |
|------|---------|-------------------|
| `app/impressum/page.tsx` | Legal notice | 23–50 (all placeholders) |
| `app/datenschutz/page.tsx` | Privacy policy | 16, 29, 32, 47–48, 54, 74, 87, 172–182 |
| `lib/menuData.ts` | Restaurant info | 140–156 (contact, address, phone) |
| `app/layout.tsx` | HTML lang | Line 29: `lang="en"` → `lang="de"` |
| `components/CookieConsentBanner.tsx` | Cookie banner | Add "reopen" trigger logic |
| `lib/consent.tsx` | Consent state | Add `resetConsent()` function |
| `next.config.ts` | Security headers | Add `headers()` function |
| `vercel.json` | Cron schedule | Already correct (daily 03:00) |
| `.env` | Runtime config | All secrets + retention env vars |

---

## 14. Testing Checklist (Manual Verification)

Run these checks **after filling placeholders** and **before public launch**:

### Impressum & Privacy Policy
- [ ] Impressum accessible from every page (footer link works)
- [ ] Datenschutz accessible from every page (footer + banner links work)
- [ ] No placeholder text (`[…]`) remains in either page
- [ ] Contact email is functional (test send)
- [ ] VAT ID format valid (DE + 9 digits) if applicable
- [ ] Handelsregister number format valid if applicable

### Cookie Consent
- [ ] Banner appears on first visit (incognito)
- [ ] "Essential only" → Google Maps stays blocked (placeholder shown)
- [ ] "Accept all" → Google Maps iframe loads
- [ ] Consent persists across reloads (localStorage)
- [ ] "Cookie Settings" link in footer reopens banner
- [ ] No cookies set before consent (check DevTools Application → Cookies)

### Data Flows
- [ ] Registration → email OTP sent → verification works
- [ ] Registration → phone OTP sent (Firebase) → verification works
- [ ] Reservation → confirmation email to guest + admin notification
- [ ] Password reset → email sent → new password works
- [ ] Admin panel → reservation status change → emails/SMS sent
- [ ] Unverified account auto-deleted after retention period (test with 1-day env)
- [ ] Old reservation auto-deleted after retention period (test with 1-day env)

### Security
- [ ] HTTPS enforced (no mixed content)
- [ ] Security headers present (check via `curl -I` or securityheaders.com)
- [ ] Rate limiting active (test 6 rapid registrations from same IP → 429)
- [ ] Disposable emails rejected (test `@tempmail.com`)
- [ ] SQL injection attempts fail (Prisma protects)
- [ ] XSS attempts in form fields sanitized (React auto-escape)

### Accessibility (Quick)
- [ ] Color contrast ≥ 4.5:1 (text) / 3:1 (large text)
- [ ] All interactive elements keyboard-reachable
- [ ] Focus indicators visible
- [ ] Images have alt text (check `Image` components)
- [ ] Form labels associated (`htmlFor` / wrapping `<label>`)

---

## 15. Lawyer Review Recommendation

**Strongly recommended:** Have a German IT/recht lawyer (or service like **eRecht24**, **Trusted Shops**, **WBS Law**) review:
1. Final Impressum (once placeholders filled)
2. Final Datenschutzerklärung (once placeholders filled)
3. AVV contracts with all processors
4. International transfer documentation

Cost: ~€300–800 for full review — far cheaper than an Abmahnung or DSGVO fine.

---

## 16. Summary

**The technical implementation is solid and privacy-by-design.**  
**The legal documents are well-structured templates but incomplete.**

**Before going live, you MUST:**
1. Replace every `[placeholder]` in `/impressum` and `/datenschutz` with real, verified data
2. Sign AVVs with all data processors
3. Verify international transfer mechanisms for US providers
4. Add a "Cookie Settings" reopen mechanism
5. Set `lang="de"` in `layout.tsx`
6. Add security headers

Once those are done, the site will be compliant for a German restaurant operation. The remaining gaps (user-facing data deletion/export, ROPA) are lower-risk but should be addressed within 3 months of launch.

---

*This report is a technical audit, not legal advice. Consult a qualified German attorney for final legal sign-off.*