#!/bin/bash
set -e

echo "========================================"
echo "  Stasis — Setup Script"
echo "  Ubuntu/Debian | Node 20 | SQLite"
echo "========================================"

# ── 1. System dependencies ──
echo ""
echo "[1/5] Checking system dependencies..."

if ! command -v node &>/dev/null; then
    echo "  Installing Node.js 20..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
echo "  Node: $(node --version) ✓"

if ! command -v git &>/dev/null; then
    sudo apt install -y git
fi
echo "  Git: $(git --version | awk '{print $3}') ✓"

echo "  All system dependencies satisfied ✓"

# ── 2. Clone if not already here ──
if [ ! -f "package.json" ]; then
    echo ""
    echo "[2/5] Cloning repository..."
    git clone https://github.com/alfi-rajasyah/stasis.git .
else
    echo ""
    echo "[2/5] Already in project directory ✓"
fi

# ── 3. Environment variables ──
echo ""
echo "[3/5] Setting up environment..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "  Created .env from template."
    echo ""
    echo "  ⚠️  EDIT .env NOW with your keys:"
    echo "     nano .env"
    echo ""
    echo "  Required:"
    echo "    DEEPSEEK_API_KEY=sk-..."
    echo "    AUTH_SECRET=any-random-string"
    echo "    GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com"
    echo "    GOOGLE_CLIENT_SECRET=GOCSPX-..."
    echo ""
    read -p "  Press Enter after editing .env..."
else
    echo "  .env already exists ✓"
fi

# Verify .env has values (not empty)
source .env 2>/dev/null || true
if [ -z "$DEEPSEEK_API_KEY" ] || [ "$DEEPSEEK_API_KEY" = "sk-your-key" ]; then
    echo "  ⚠️  DEEPSEEK_API_KEY not set! Edit .env and re-run."
    exit 1
fi

# ── 4. Install npm dependencies ──
echo ""
echo "[4/5] Installing npm packages..."
npm install

# ── 5. Database ──
echo ""
echo "[5/5] Setting up database..."
mkdir -p data
npx prisma migrate dev --name init 2>/dev/null || npx prisma migrate deploy
npx prisma db seed 2>/dev/null || echo "  Seed already applied, skipping"

# ── 6. Build and start ──
echo ""
echo "[6/6] Building..."
npm run build

echo ""
echo "========================================"
echo "  Setup complete!"
echo "  Starting Stasis..."
echo "========================================"
npm start
