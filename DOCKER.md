# Pool-Cal Docker Deployment

## Quick Start

```bash
# 1. Clone
git clone https://github.com/erquier/pool-cal
cd pool-cal

# 2. Create env file
cp .env.example .env.local
# Edit .env.local with your credentials

# 3. Run with Docker
docker compose up -d
# → http:...### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_GOOGLE_ID` | ✅ | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | ✅ | Google OAuth Client Secret |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | ✅ | Service account JSON (minified, single line) |
| `GOOGLE_CALENDAR_ID` | ✅ | Pool calendar ID |
| `AUTH_SECRET` | ✅ | Generate with `openssl rand -base64 32` |
| `AUTH_URL` | ✅ | Public URL of the app |
| `AUTH_TRUST_HOST` | ✅ | Set to `http://localhost:3000` for dev, or the public URL |

## Deploy on your server (e-docker-2)

```bash
# Copy files to the server
scp -r pool-cal user@server:/opt/pool-cal

# On the server
cd /opt/pool-cal
cp .env.example .env.local
# Edit .env.local

docker compose up -d
```

Then set up a reverse proxy (Nginx Proxy Manager or similar) to point `pool-cal.erqlabs.com` → `http://pool-cal:3000`.

## Build without cache

```bash
docker compose build --no-cache
docker compose up -d
```

## View logs

```bash
docker compose logs -f
```
