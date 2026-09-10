# PenguinStyle - Web Game Proxy

A lightweight, unrestricted web proxy application for hosting web-based gaming assets on a free cloud tier.

## Features

- 🎮 Proxy any web-based game or content through an iframe
- ⚡ Fast caching with 7-day max-age headers
- 🔒 Strips security headers (X-Frame-Options, CSP) for embedded content
- 📱 Responsive UI with fullscreen support
- 🚀 Easy deployment to Railway + GitHub Pages
- ✅ Whitelist support for trusted gaming domains

## Supported Gaming Sites

- Roblox (roblox.com)
- Y8 Games (y8.com)
- Cool Math Games (coolmathgames.com)
- Now.gg (now.gg)
- YouTube (youtube.com)

## Architecture

- **Frontend:** Static HTML/CSS/JS hosted on GitHub Pages
- **Backend:** Express.js proxy server hosted on Railway
- **Communication:** Frontend sends requests to Railway backend at `/game-tunnel?url=<target>`

## Setup & Deployment

### Prerequisites

- Node.js 18+
- npm or yarn
- Railway account (free tier: [railway.app](https://railway.app))
- GitHub account with Pages enabled

### Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the server
npm start
```

Visit `http://localhost:3000` in your browser.

### Deploy to Railway

1. Push to GitHub
2. Go to [Railway Dashboard](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `ishaany83-arch/PenguinStyle`
5. Add environment variables from `.env.example`
6. Railway auto-deploys on every push
7. Copy your Railway URL (e.g., `https://penguin-style-prod.up.railway.app`)

### Connect Frontend to Railway Backend

Update `public/index.html` to use your Railway backend URL:

```javascript
const apiUrl = 'https://your-railway-app.up.railway.app';
const proxyUrl = apiUrl + '/game-tunnel?url=' + encodeURIComponent(rawUrl);
```

Or use the auto-loaded config from `public/config.js` by setting the env var in Railway:

```
REACT_APP_API_URL=https://your-railway-app.up.railway.app
```

### Deploy Frontend to GitHub Pages

1. Go to repo Settings → Pages
2. Set source to `gh-pages` branch
3. The GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) automatically deploys on push to main
4. Frontend is live at: `https://ishaany83-arch.github.io/PenguinStyle/`

## Environment Variables

See `.env.example` for all available options:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `RATE_LIMIT_MAX_REQUESTS` - Requests per minute (default: 30)
- `PROXY_TIMEOUT` - Request timeout in ms (default: 30000)
- `BLOCKED_HOSTS` - Comma-separated list of blocked hostnames
- `ALLOWED_HOSTS` - Comma-separated whitelist of allowed domains
- `REACT_APP_API_URL` - Backend API URL for frontend

## Security Considerations

⚠️ **This proxy strips security headers intentionally** to allow embedded content. Use with caution:

- ✅ Whitelist is enabled by default for gaming sites only
- ✅ Rate limiting prevents abuse (30 requests/minute)
- ✅ SSRF protection blocks localhost and internal addresses
- ✅ Monitor bandwidth usage on Railway
- ❌ Do NOT expose without authentication in public production

## API Endpoints

### `GET /status`

Health check endpoint.

```bash
curl https://your-railway-app.up.railway.app/status
```

Response:

```json
{
  "status": "ok",
  "uptime": 1234.56,
  "timestamp": "2026-09-10T12:34:56.789Z",
  "environment": "production"
}
```

### `GET /game-tunnel?url=<target_url>`

Proxy endpoint for embedding content.

```bash
curl 'https://your-railway-app.up.railway.app/game-tunnel?url=https://roblox.com'
```

## Troubleshooting

### 404 on Railway

- Check that Railway has the correct start command: `node server.js`
- Verify `PORT` env var matches Railway's assigned port

### CORS errors in browser

- Ensure `cors()` middleware is enabled in `server.js`
- Check Railway backend URL in frontend code

### Proxy returns 403 Forbidden

- Requested domain is not in the whitelist
- Update `ALLOWED_HOSTS` in Railway environment variables

### Proxy returns 502 Bad Gateway

- Target URL may be unreachable or blocked
- Check Railway logs: `railway logs`
- Verify the target URL is publicly accessible

## License

MIT

## Author

Created by ishaany83-arch
