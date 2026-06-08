# Stasis

Personal finance manager. Track subscriptions, bills, debts, and budget — with AI assistance.

## Features

- **Dashboard** — Income, committed, free cash, upcoming dues, debt progress
- **Budget Planner** — Monthly allocations with inline editing
- **Subscription Tracker** — Recurring subs with monthly burn total
- **Bill Tracker** — Bills with due dates and paid/unpaid status
- **Debt Tracker** — Principal, interest, payoff projections
- **AI Assistant** — Natural language entry (DeepSeek, OpenAI, Anthropic)
- **Google OAuth** — Secure login with your Google account
- **PWA** — Install on phone, works offline
- **Dark mode** — Dark premium design throughout

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript |
| Styling | Tailwind CSS, shadcn/ui |
| Database | SQLite via Prisma |
| API | tRPC |
| Auth | Auth.js (Google) |
| AI | Vercel AI SDK |
| PWA | next-pwa |
| Deploy | Docker |

## Quick Start

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Environment

```env
DATABASE_URL=file:./data/stasis.db
DEEPSEEK_API_KEY=sk-xxx
AUTH_SECRET=$(openssl rand -hex 32)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

## Google OAuth

1. Google Cloud Console → OAuth 2.0 Client ID (Web application)
2. Redirect URI: `http://localhost:3000/api/auth/callback/google`
3. Add Client ID + Secret to `.env`

## Docker

```bash
docker compose up -d
```

SQLite persists in `./data`. Back up: `cp data/stasis.db backups/stasis-$(date +%F).db`

## Commands

```bash
npm run dev      # Dev server
npm run build    # Production build
npm test         # Vitest tests
npm run test:e2e # Playwright E2E
```
