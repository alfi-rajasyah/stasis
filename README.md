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

## Requirements

- **Node.js 18+** and **git**

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

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create an OAuth 2.0 Client ID (Web application)
3. Add these **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   https://your-domain.com/api/auth/callback/google
   ```
4. Copy Client ID and Secret to `.env`

### Proxied deployments (Cloudflare Tunnel, Nginx, etc.)

If your app runs behind a proxy (localhost → public domain), you MUST set
`AUTH_URL` in `.env`:

```env
AUTH_URL=https://your-public-domain.com
```

Without this, Auth.js generates redirect URIs using `localhost` instead of your public domain, causing `redirect_uri_mismatch` errors.

## Troubleshooting

| Error | Fix |
|---|---|
| `redirect_uri_mismatch` | Add your domain to Google Cloud Console authorized URIs AND set `AUTH_URL` in `.env` |
| `UntrustedHost` | Already handled (`trustHost: true` in auth config) |
| "doesn't comply with Google's OAuth 2.0 policies" | Check `AUTH_URL` matches your actual domain exactly (https://, no trailing slash) |
| `AUTH_SECRET` required | Generate with `openssl rand -hex 32` |
| Login page shows tab bar | Fixed — tab bar hides on `/login` route |

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
