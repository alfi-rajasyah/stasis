# Stasis Setup Guide

## Prerequisites

- Node.js 20+
- npm
- Git
- Docker & Docker Compose (for deployment)
- Google Cloud account (for OAuth)
- DeepSeek API key (or OpenAI/Anthropic)

## 1. Clone & Install

```bash
git clone https://github.com/alfi-rajasyah/stasis.git
cd stasis
npm install
```

## 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `DEEPSEEK_API_KEY` | [platform.deepseek.com](https://platform.deepseek.com) → API Keys |
| `AUTH_SECRET` | Run `openssl rand -hex 32` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → OAuth (see below) |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth (see below) |

**Optional** — other AI providers:
| Variable | Where |
|---|---|
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

## 3. Google OAuth Setup

### Create credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a project (or select existing)
3. **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: `Stasis`
   - Add your email as test user
   - Save
4. **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `Stasis`
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     https://your-domain.com/api/auth/callback/google
     ```
   - Create

5. Copy the **Client ID** and **Client Secret** to your `.env`

## 4. Database

```bash
npx prisma migrate dev
npx prisma db seed
```

This creates the SQLite database with sample categories and data.

## 5. Run

```bash
npm run dev
```

Open http://localhost:3000 → login with Google → done.

## Docker Deployment

### On your VM

```bash
git clone https://github.com/alfi-rajasyah/stasis.git
cd stasis
```

Create `.env` with your production values:

```env
DATABASE_URL=file:/app/data/stasis.db
DEEPSEEK_API_KEY=sk-your-key
AUTH_SECRET=your-generated-secret
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
```

Build and run:

```bash
docker compose up -d
```

The app runs on `http://localhost:3000` inside the container. For public access, use one of:

### Option A: Cloudflare Tunnel

```bash
# Install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared

# Create tunnel
./cloudflared tunnel create stasis
./cloudflared tunnel route dns stasis stasis.your-domain.com

# Run
./cloudflared tunnel run --url http://localhost:3000 stasis
```

### Option B: Nginx reverse proxy

```nginx
server {
    listen 443 ssl;
    server_name stasis.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### Backup

```bash
# Daily SQLite backup via cron
0 3 * * * cp /opt/stasis/data/stasis.db /opt/stasis/backups/stasis-$(date +\%F).db
```

## Troubleshooting

**Login page shows tab bar:** Clear browser cache, hard refresh (Cmd+Shift+R)

**AI chat not working:** Verify `DEEPSEEK_API_KEY` in `.env`, restart server

**Database errors:** Run `npx prisma migrate dev` then `npx prisma db seed`

**Docker build fails:** Make sure `.env` exists with valid values before `docker compose up`
