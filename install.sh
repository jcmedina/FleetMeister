#!/bin/bash
# FleetMeister — Install Script
# Sets up the app, installs dependencies, builds the frontend,
# configures your Strava credentials, and starts the background service.

set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
RESET="\033[0m"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo -e "${BOLD}🥾 FleetMeister — Setup${RESET}"
echo "──────────────────────────────────────"
echo ""

# ─── 1. Check Node.js ────────────────────────────────────────────────────────

if ! command -v node &>/dev/null; then
  echo -e "${RED}✗ Node.js not found.${RESET}"
  echo "  Install it from https://nodejs.org (v22 or later required)"
  exit 1
fi

NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo -e "${RED}✗ Node.js v${NODE_MAJOR} found — v22 or later is required.${RESET}"
  echo "  Download the latest LTS from https://nodejs.org"
  exit 1
fi

NODE_PATH=$(which node)
echo -e "${GREEN}✓ Node.js $(node --version) found${RESET} at $NODE_PATH"

# ─── 2. Install PM2 ──────────────────────────────────────────────────────────

if ! command -v pm2 &>/dev/null; then
  echo ""
  echo -e "${YELLOW}→ PM2 not found. Installing...${RESET}"
  sudo npm install -g pm2
  echo -e "${GREEN}✓ PM2 installed${RESET}"
else
  echo -e "${GREEN}✓ PM2 $(pm2 --version) found${RESET}"
fi

# ─── 3. Install backend dependencies ─────────────────────────────────────────

echo ""
echo -e "${YELLOW}→ Installing backend dependencies...${RESET}"
cd "$SCRIPT_DIR/backend"
npm install --silent
echo -e "${GREEN}✓ Backend dependencies installed${RESET}"

# ─── 4. Install & build frontend ─────────────────────────────────────────────

echo ""
echo -e "${YELLOW}→ Installing frontend dependencies...${RESET}"
cd "$SCRIPT_DIR/frontend"
rm -rf node_modules package-lock.json
npm install --silent
echo -e "${GREEN}✓ Frontend dependencies installed${RESET}"

echo ""
echo -e "${YELLOW}→ Building frontend...${RESET}"
npm run build --silent
echo -e "${GREEN}✓ Frontend built${RESET}"

# ─── 5. Configure .env ───────────────────────────────────────────────────────

cd "$SCRIPT_DIR/backend"

if [ -f ".env" ]; then
  echo ""
  echo -e "${YELLOW}→ A .env file already exists. Skipping credential setup.${RESET}"
  echo "  To reconfigure, delete backend/.env and run this script again."
else
  echo ""
  echo -e "${BOLD}Strava API credentials${RESET}"
  echo "  You need a Strava API app to continue."
  echo "  → Go to https://www.strava.com/settings/api"
  echo "  → Create an app (name it anything)"
  echo "  → Set Authorization Callback Domain to: localhost"
  echo "  → Copy your Client ID and Client Secret"
  echo ""

  read -p "  Client ID: " STRAVA_CLIENT_ID
  read -p "  Client Secret: " STRAVA_CLIENT_SECRET

  # Generate a random session secret
  SESSION_SECRET=$(node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))")

  cat > .env <<EOF
STRAVA_CLIENT_ID=${STRAVA_CLIENT_ID}
STRAVA_CLIENT_SECRET=${STRAVA_CLIENT_SECRET}
STRAVA_REDIRECT_URI=http://localhost:3001/auth/callback
SESSION_SECRET=${SESSION_SECRET}
PORT=3001
FRONTEND_URL=http://localhost:3001
EOF

  echo -e "${GREEN}✓ .env configured${RESET}"
fi

# ─── 6. Start the service with PM2 ───────────────────────────────────────────

echo ""
echo -e "${YELLOW}→ Starting FleetMeister with PM2...${RESET}"

# Kill existing daemon to avoid stale binary issues (e.g. after a Node upgrade)
pm2 kill &>/dev/null || true

pm2 start "$SCRIPT_DIR/backend/server.js" \
  --name fleetmeister \
  --interpreter "$NODE_PATH" \
  --cwd "$SCRIPT_DIR/backend" \
  > /dev/null

pm2 save > /dev/null
echo -e "${GREEN}✓ FleetMeister is running${RESET}"

# ─── 7. Set up auto-start on login ───────────────────────────────────────────

echo ""
echo -e "${BOLD}Auto-start on login${RESET}"
echo "  Run the command below so FleetMeister starts automatically when you log in."
echo "  (Copy and paste the entire line that pm2 prints — it starts with 'sudo')"
echo ""
pm2 startup | grep "sudo"
echo ""

# ─── Done ────────────────────────────────────────────────────────────────────

echo "──────────────────────────────────────"
echo -e "${GREEN}${BOLD}✓ All done!${RESET}"
echo ""
echo "  Open http://localhost:3001 in your browser"
echo "  and click Connect with Strava to get started."
echo ""
echo "  Useful commands:"
echo "    pm2 list               — check status"
echo "    pm2 logs fleetmeister  — view logs"
echo "    pm2 restart fleetmeister — restart after changes"
echo ""
