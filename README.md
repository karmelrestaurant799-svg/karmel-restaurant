# Karmel Café & Restaurant

Marketing site with account registration (email + phone verification),
table reservations, and an admin dashboard for managing them.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)
- [Prisma](https://www.prisma.io) + PostgreSQL
- [NextAuth v5](https://authjs.dev) (credentials + Google/Facebook OAuth)
- [Firebase Authentication](https://firebase.google.com/docs/auth) for phone OTP
- [Nodemailer](https://nodemailer.com) + Gmail SMTP for transactional email
- [Upstash Redis](https://upstash.com) for rate limiting
- [DeepL](https://www.deepl.com/pro-api) for the language switcher, and optionally
  [Twilio](https://www.twilio.com) for reservation SMS

## Getting started

1. Copy `.env.example` to `.env` and fill in real values — see
   [`DEPLOYMENT.md`](./DEPLOYMENT.md) for step-by-step instructions for every
   external service (database, auth providers, Gmail, Firebase, Upstash, DeepL).
2. Install dependencies and set up the database:
   ```bash
   npm install
   npx prisma db push
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run the test suite |
| `npm run db:push` | Push the Prisma schema to the database |
| `npm run make-admin -- <email>` | Promote a registered user to `ADMIN` |

## Data model

See [`prisma/schema.prisma`](./prisma/schema.prisma) for the full schema —
`User` (auth + verification state), `Reservation` (table bookings),
`MenuCategory` / `MenuItem` (the menu, edited from the admin area and seeded with
`scripts/seed-menu.mjs`), `Translation` (cached per-language UI text), plus the
standard Auth.js adapter tables (`Account`, `Session`, `VerificationToken`).
Restaurant details such as the address and opening hours live in
[`lib/menuData.ts`](./lib/menuData.ts).

## Deployment

Full setup and deployment instructions (all required environment variables,
external service setup, first-admin bootstrapping) are in
[`DEPLOYMENT.md`](./DEPLOYMENT.md).
