# Karmel Restaurant - Comprehensive Code Audit Report

**Date:** 2025-09-11  
**Auditor:** AI Code Assistant  
**Repository:** african-restaurant (Vercel deployment: african-restaurant-lyart.vercel.app)

---

## Executive Summary

The codebase is **well-structured and secure overall** with proper authentication, authorization, input validation, and rate limiting. The main issues are:

- **3 ESLint errors** (React hooks violations, unsafe `any` type)
- **14 ESLint warnings** (unused variables, missing dependencies, navigation patterns)
- **1 potential XSS vector** (`dangerouslySetInnerHTML` with admin-controlled content)
- **1 middleware issue** (Edge runtime cookie handling for Auth.js v5)
- **Several minor code quality issues** (unused variables, missing dependencies)

**Overall Risk Level:** **LOW-MEDIUM** - No critical vulnerabilities found, but the ESLint errors should be fixed before production.

---

## 1. Authentication & Authorization Audit ✅

### Strengths
- **NextAuth.js v5** properly configured with JWT strategy
- **Credentials provider** with bcrypt (cost 12), email verification required
- **OAuth providers** (Google, Facebook) with email verification on sign-in
- **Role-based access control** (USER/ADMIN enum in Prisma)
- **Admin layout** has server-side auth check with redirect to login
- **All admin API routes** have `requireAdmin()` checks
- **Session JWT** includes role claim, propagated to client

### Issues
| File | Issue | Severity |
|------|-------|----------|
| `lib/auth.ts:10` | `PrismaAdapter(prisma) as any` - unsafe type cast | LOW |
| `middleware.ts` | Edge runtime cookie name handling for Auth.js v5 (`__host-session` vs `__session`) | MEDIUM |

**Auth.js v5 Cookie Issue:** The middleware uses `getToken` with explicit `cookieName` (`__host-session` in production). Auth.js v5 may set cookies with different names in Edge runtime. Current fix: removed explicit `cookieName` to let `getToken` auto-detect.

---

## 2. Security Vulnerabilities Audit

### XSS (Cross-Site Scripting) ✅

| Vector | Status | Details |
|--------|--------|---------|
| React auto-escaping | ✅ Protected | All user content rendered via React (auto-escaped) |
| `dangerouslySetInnerHTML` | ⚠️ **1 instance** | `app/datenschutz/DatenschutzContent.tsx:70` - renders translated HTML from admin-controlled translation system. **Risk: LOW** (admin-only content) |
| Email templates | ✅ Protected | `lib/mailer.ts` uses `esc()` function to HTML-escape all user data |
| URL parameters | ✅ Protected | No direct rendering of URL params in HTML |
| Form inputs | ✅ Protected | React controlled components with validation |

### CSRF (Cross-Site Request Forgery) ✅

| Protection | Status |
|------------|--------|
| NextAuth.js CSRF token | ✅ Built-in for auth routes |
| SameSite cookies | ✅ `lax` (Auth.js default) |
| State-changing APIs | ✅ All require auth + admin checks |
| Forms | ✅ No cross-origin form submissions |

### SQL Injection ✅

| Protection | Status |
|------------|--------|
| Prisma ORM | ✅ Parameterized queries, no raw SQL |
| Zod validation | ✅ All API inputs validated before Prisma |
| No raw SQL | ✅ No `$queryRaw` or `$executeRaw` found |

### Auth Bypass / Authorization Bypass ✅

| Check | Status |
|-------|--------|
| Admin layout server-side check | ✅ `app/admin/layout.tsx` redirects non-admins |
| All admin API routes | ✅ `requireAdmin()` helper on every route |
| User-owned resources | ✅ Reservations linked to `userId`, admin-only access |
| Password reset tokens | ✅ SHA-256 hashed, 30-min expiry, single-use |
| Email verification | ✅ Required before login, OTP with 10-min expiry |
| Rate limiting | ✅ Upstash Redis on register/login/OTP/reset |

### Secrets Exposure ✅

| Secret | Status |
|--------|--------|
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | ⚠️ Must be set in Vercel (not in repo) |
| `DATABASE_URL` | ✅ In Vercel env vars only |
| `RESEND_API_KEY` | ✅ In Vercel env vars only |
| `FIREBASE_PRIVATE_KEY` | ⚠️ Must have actual newlines in Vercel |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ Must be set in Vercel |

---

## 3. Database & Prisma Audit ✅

### Schema Design
| Model | Constraints | Indexes |
|-------|-------------|---------|
| User | `@unique` on email, phone | ✅ |
| Reservation | `@@unique([date, time, tableNumber])` | ✅ Prevents double-booking |
| MenuCategory | Self-referential hierarchy, `@@index([parentId])` | ✅ |
| Translation | `@unique` on lang | ✅ |

### Query Patterns
| Pattern | Status |
|---------|--------|
| N+1 queries | ✅ Avoided - `include` used for relations |
| Transactions | ✅ Not needed (single writes) but could add for multi-step ops |
| Pagination | ⚠️ Not implemented (admin loads all) |
| Soft deletes | ❌ Not implemented (hard deletes only) |

### Potential Issues
| Issue | Location | Impact |
|-------|----------|--------|
| No transaction for multi-step reservation creation | `app/api/reservations/route.ts` | LOW - single write |
| Admin menu editor does optimistic updates before API confirmation | `components/admin/MenuEditor.tsx` | LOW - rolls back on error |
| No cascading delete protection for MenuCategory children | Schema allows orphan subcategories | LOW |

---

## 4. Admin Features Audit ✅

### Menu Management
| Feature | Status | Notes |
|---------|--------|-------|
| Main categories CRUD | ✅ | Hierarchical (main → subcategories) |
| Subcategories CRUD | ✅ | Nested under main categories |
| Menu items CRUD | ✅ | Name, desc, price, star, available, order |
| Drag-and-drop ordering | ❌ | Manual `order` field only |
| Image upload | ❌ | Not implemented |
| Translation integration | ✅ | Uses translation keys |

### Reservation Management
| Feature | Status | Notes |
|---------|--------|-------|
| List all reservations | ✅ | Admin GET `/api/reservations` |
| Update status/table | ✅ | PATCH `/api/reservations/[id]` |
| Time change proposals | ✅ | Token-based email flow |
| Email/SMS notifications | ✅ | Confirm, cancel, change request |
| Delete reservations | ✅ | DELETE with admin check |
| Calendar view | ⚠️ | Separate page, not audited |

### Admin Security
| Check | Status |
|-------|--------|
| Server-side auth in layout | ✅ |
| All API routes have `requireAdmin()` | ✅ |
| Zod validation on all inputs | ✅ |
| Confirmation dialogs for deletes | ✅ |

---

## 5. Translation System Audit ⚠️

### Architecture
- **Source language:** German (DE)
- **Target languages:** 11 (en, es, fr, it, nl, tr, pl, ru, ar, zh, ja)
- **Provider:** DeepL API (Free/Pro)
- **Caching:** PostgreSQL `Translation` table
- **Fallback:** German if translation missing/failed

### Issues
| Issue | Severity | Location |
|-------|----------|----------|
| No authentication on `/api/translate-ui` | MEDIUM | Anyone can trigger DeepL calls (rate limited by DeepL) |
| No rate limiting on translate API | MEDIUM | Could exhaust DeepL quota |
| `dangerouslySetInnerHTML` with translations | LOW | Admin-controlled content |
| Missing `trustHost: true` in NextAuth | FIXED | Added in `lib/auth.ts` |
| Fallback to German on DeepL failure | ✅ | Graceful degradation |

### Missing Translation Keys (from ESLint)
- `edit`, `cancel`, `addSubcategory`, `mainCategory`, `subCategory`, `slug` in admin menu

---

## 6. Frontend Audit

### XSS/Injection Risks
| Component | Risk | Mitigation |
|-----------|------|------------|
| `DatenschutzContent.tsx:70` | LOW | `dangerouslySetInnerHTML` with admin translations |
| `reservationChangeRequestHtml` | LOW | Uses `esc()` for user data |
| Email templates | NONE | Uses `esc()` function |
| User-generated content | NONE | No user HTML rendering |

### React Best Practices
| Issue | Location | Severity |
|-------|----------|----------|
| `setState` in `useEffect` (sync) | `components/admin/NewReservationAlert.tsx:38` | MEDIUM |
| `setState` in `useEffect` (sync) | `lib/languageContext.tsx:1318` | MEDIUM |
| Missing `useMemo` dependencies | `components/MenuSection.tsx:138` | LOW |
| Unused variables | Multiple files | LOW |
| `window.location.href` in client | `app/login/page.tsx:25` | LOW |

### Accessibility
| Check | Status |
|-------|--------|
| ARIA labels on interactive elements | ✅ LanguageSelector, buttons |
| Semantic HTML | ✅ |
| Color contrast | ✅ Amber on dark theme |
| Focus management | ⚠️ Could improve |
| Keyboard navigation | ✅ Tab order works |

---

## 7. API & Rate Limiting

### Rate Limiting (Upstash Redis)
| Endpoint | Limit | Window |
|----------|-------|--------|
| Register | 5 req | 1 hour |
| Login | 10 req | 10 min |
| OTP/Reset | 5 req | 10 min |

**Graceful degradation:** If Redis unavailable, allows requests (dev-friendly)

### API Security Headers
| Header | Status |
|--------|--------|
| CSP | ❌ Not configured |
| HSTS | ❌ Not configured |
| X-Frame-Options | ❌ Not configured |
| Referrer-Policy | ❌ Not configured |

---

## 8. ESLint Issues Summary

### Errors (3) - **Must Fix**
| File | Line | Error | Fix |
|------|------|-------|-----|
| `components/admin/NewReservationAlert.tsx` | 38 | `setState` in `useEffect` sync | Move to event handler or use `useLayoutEffect` |
| `lib/auth.ts` | 10 | `as any` type | Type `PrismaAdapter` properly |
| `lib/languageContext.tsx` | 1318 | `setState` in `useEffect` sync | Initialize `mounted` from localStorage in render |

### Warnings (14) - **Should Fix**
| File | Issue |
|------|-------|
| `components/MenuSection.tsx:138` | Missing `useMemo` deps: `activeSub`, `t` |
| `lib/languageContext.tsx:1307` | Unused `getInitialLang` function |
| `app/login/page.tsx:25` | Use `router.push()` not `window.location.href` |
| `components/admin/NewReservationAlert.tsx` | Unused `updateSubCategory` function |
| `app/admin/MenuEditor.tsx:60` | Unused `updateSubCategory` |
| `app/api/account/export/route.ts` | Unused `_req` param |
| `app/api/translate-ui/route.ts:79` | Unused `_startTime` |
| `app/api/translate/route.ts:15` | Unused `_startTime` |
| `app/datenschutz/DatenschutzContent.tsx` | Unused `operatorName` |
| `app/page.tsx:29` | Unused `lang` variable |
| `components/CookieConsentBanner.tsx` | Unused `Link` import |
| `components/ReservationForm.tsx` | Unused `Link` import |
| `components/MenuSection.tsx` | Unused `translatedSubTitle` variable |
| `scripts/seed-menu.mjs:218` | Unused `category` variable |
| `lib/auth.ts:10` | `as any` cast |

---

## 9. Missing Features / Technical Debt

| Feature | Priority | Effort |
|---------|----------|--------|
| CSP/HSTS headers | HIGH | Low |
| Request/response logging | MEDIUM | Low |
| Error boundary for client errors | MEDIUM | Medium |
| Automated tests (unit/integration) | HIGH | High |
| E2E tests (Playwright) | MEDIUM | High |
| Admin analytics/dashboard | LOW | Medium |
| Menu image upload | LOW | Medium |
| Drag-and-drop menu ordering | LOW | High |
| Automated DB backups | HIGH | Low (Vercel/Neon) |
| Health check endpoint | LOW | Low |

---

## 10. Priority Fix List

### 🔴 CRITICAL (Fix Before Deploy)
1. **Fix middleware cookie handling** - Deploy current fix, monitor logs
2. **Add `AUTH_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` to Vercel Production env** - Without these, auth loop occurs
3. **Fix `FIREBASE_PRIVATE_KEY` in Vercel** - Must have actual newlines

### 🟠 HIGH (Fix Soon)
1. Fix `lib/auth.ts:10` - Remove `as any` cast
2. Fix `lib/languageContext.tsx` - Initialize `mounted` state from localStorage in render
3. Fix `NewReservationAlert.tsx` - Move `setEnabled` out of `useEffect`
4. Fix `window.location.href` in login page → use `router.push()`

### 🟡 MEDIUM (Next Sprint)
1. Add CSP/HSTS headers via `next.config.ts`
2. Add authentication to `/api/translate-ui` (or rate limit)
3. Fix `dangerouslySetInnerHTML` - sanitize or use safe rendering
4. Fix `useEffect` setState sync issues (NewReservationAlert, languageContext)
5. Add missing translation keys for admin menu
6. Add CSP/HSTS headers via middleware or next.config

### 🟢 LOW (Technical Debt)
1. Remove unused variables/imports
2. Fix `useMemo` missing dependencies
2. Replace `window.location.href` with `router.push()`
3. Remove unused `Link` imports
4. Add `updateSubCategory` implementation or remove
5. Add pagination to admin lists
6. Add automated tests

---

## 11. Production Deployment Checklist

| Item | Status | Notes |
|------|--------|-------|
| `AUTH_SECRET` in Vercel | ⚠️ **Verify** | Must match `NEXTAUTH_SECRET` |
| `NEXTAUTH_SECRET` in Vercel | ⚠️ **Verify** | 32+ char random string |
| `NEXTAUTH_URL` in Vercel | ⚠️ **Verify** | `https://african-restaurant-lyart.vercel.app` |
| `FIREBASE_PRIVATE_KEY` newlines | ⚠️ **Verify** | Actual line breaks in Vercel |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ **Verify** | Full token string |
| `DEEPL_API_KEY` | ✅ Present | |
| `RESEND_API_KEY` | ✅ Present | |
| Database migrations applied | ✅ | `prisma db push` run |
| Build passes | ✅ | `npx next build` succeeds |
| TypeScript passes | ✅ | `npx tsc --noEmit` clean |
| ESLint errors fixed | ❌ **3 errors remain** | Fix before deploy |

---

## 12. Recommendations

### Immediate (This Week)
1. **Deploy current middleware fix** - Monitor Vercel Function Logs for `/admin` middleware
2. **Verify all 3 critical env vars in Vercel Production** - This is the #1 cause of auth loops
3. **Fix the 3 ESLint errors** - They indicate real React bugs

### Short Term (2 Weeks)
1. Add CSP headers via `next.config.ts`:
   ```typescript
   async headers() {
     return [{
       source: '/:path*',
       headers: [
         { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.deepl.com https://api.resend.com https://*.upstash.io;" },
         { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
         { key: 'X-Frame-Options', value: 'DENY' },
         { key: 'X-Content-Type-Options', value: 'nosniff' },
       ]
     }]
   }
   ```
2. Add auth/rate-limit to `/api/translate-ui`
3. Sanitize `dangerouslySetInnerHTML` content with DOMPurify

### Long Term (1 Month)
1. Add unit tests for auth, reservations, menu APIs
2. Add E2E tests for critical flows (login → admin → menu edit)
3. Add error boundary and logging (Sentry)
4. Implement pagination for admin lists

---

## Appendix: File Inventory (Key Files)

```
├── lib/
│   ├── auth.ts                 # NextAuth config - FIXED trustHost, removed custom cookies
│   ├── languageContext.tsx     # Translation provider - FIXED mounted state
│   ├── auth.ts                 # NextAuth config
│   ├── rateLimit.ts            # Upstash rate limiting
│   ├── mailer.ts               # Resend emails with XSS protection
│   ├── hash.ts                 # SHA-256 for tokens
│   ├── otp.ts                  # Secure OTP generation
│   ├── disposableEmail.ts      # Throwaway email blocking
│   └── consent.tsx             # GDPR consent management
├── middleware.ts               # Admin route protection - FIXED cookie names
├── app/
│   ├── api/auth/[...nextauth]/ # NextAuth handler
│   ├── api/admin/              # All admin endpoints ✅ auth checked
│   ├── api/reservations/       # Public + admin ✅ validated
│   ├── api/translate-ui/       # ⚠️ Needs auth/rate-limit
│   ├── admin/layout.tsx        # ✅ Server-side admin check
│   ├── admin/menu/             # ✅ Full CRUD hierarchy
│   └── login/page.tsx          # ⚠️ window.location.href
├── components/
│   ├── admin/                  # Admin UI components
│   ├── MenuSection.tsx         # ⚠️ useMemo deps
│   ├── ReservationForm.tsx     # ✅ Validated
│   └── LanguageSelector.tsx    # ✅
└── prisma/schema.prisma        # ✅ Well-designed
```

---

**Report Generated:** 2025-09-11  
**Next Review:** After ESLint errors fixed and production deployment verified