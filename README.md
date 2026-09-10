# PenguinStyle - Web Game Proxy

A lightweight, unrestricted web proxy application for hosting web-based gaming assets on a free cloud tier.

## Features

- 🎮 Proxy any web-based game or content through an iframe
- ⚡ Fast caching with 7-day max-age headers
- 🔒 Strips security headers (X-Frame-Options, CSP) for embedded content
- 📱 Responsive UI with fullscreen support
- 🚀 Easy deployment to Fly.io + GitHub Pages
- ✅ Whitelist support for trusted gaming domains

## Supported Gaming Sites

- Roblox (roblox.com)
- Y8 Games (y8.com)
- Cool Math Games (coolmathgames.com)
- Now.gg (now.gg)
- YouTube (youtube.com)

## Architecture

- **Frontend:** Static HTML/CSS/JS hosted on GitHub Pages
- **Backend:** Express.js proxy server hosted on Fly.io
- **Communication:** Frontend sends requests to Fly.io backend at `/game-tunnel?url=<target>`

## Setup & Deployment

### Prerequisites

- Node.js 18+
- npm or yarn
- Fly.io account (free tier: [fly.io](https://fly.io))
- GitHub account with Pages enabled
- Fly CLI installed: `npm install -g flyctl`

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

### Deploy to Fly.io

1. **Install Fly CLI:**
   ```bash
   npm install -g flyctl
   ```

2. **Log in to Fly:**
   ```bash
   flyctl auth login
   ```

3. **Initialize Fly app:**
   ```bash
   flyctl launch
   ```
   - Choose an app name (e.g., `penguin-style-proxy`)
   - Choose region (e.g., `sjc` for San Jose)
   - Say "No" to adding a database
   - Say "Yes" to deploying now

4. **Set environment variables:**
   ```bash
   flyctl secrets set ALLOWED_HOSTS=roblox.com,y8.com,coolmathgames.com,now.gg,youtube.com
   flyctl secrets set NODE_ENV=production
   flyctl secrets set RATE_LIMIT_MAX_REQUESTS=30
   ```

5. **Deploy:**
   ```bash
   flyctl deploy
   ```

6. **Get your Fly URL:**
   ```bash
   flyctl info
   ```
   Your app will be at: `https://penguin-style-proxy.fly.dev`

### Connect Frontend to Fly.io Backend

Update `public/index.html` to use your Fly.io backend URL:

```javascript
const apiUrl = 'https://penguin-style-proxy.fly.dev'; // Replace with your Fly app name
const proxyUrl = apiUrl + '/game-tunnel?url=' + encodeURIComponent(rawUrl);
```

Or use environment variable in your `public/config.js`:

```javascript
const API_URL = 'https://penguin-style-proxy.fly.dev'; // Set during build
```

### Deploy Frontend to GitHub Pages

1. Go to repo Settings → Pages
2. Set source to `gh-pages` branch
3. Frontend is live at: `https://ishaany83-arch.github.io/PenguinStyle/`

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
- ✅ Monitor bandwidth usage on Fly.io
- ❌ Do NOT expose without authentication in public production

## API Endpoints

### `GET /status`

Health check endpoint.

```bash
curl https://penguin-style-proxy.fly.dev/status
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
curl 'https://penguin-style-proxy.fly.dev/game-tunnel?url=https://roblox.com'
```

## Fly.io Useful Commands

```bash
# View logs
flyctl logs

# Redeploy
flyctl deploy

# Scale up/down
flyctl scale count web=2

# List apps
flyctl apps list

# Destroy app
flyctl apps destroy penguin-style-proxy
```

## Troubleshooting

### App won't deploy

- Check Fly.io logs: `flyctl logs`
- Ensure `Procfile` exists with `web: node server.js`
- Verify Node.js version in `fly.toml`

### CORS errors in browser

- Ensure `cors()` middleware is enabled in `server.js`
- Check Fly.io backend URL in frontend code

### Proxy returns 403 Forbidden

- Requested domain is not in the whitelist
- Update via: `flyctl secrets set ALLOWED_HOSTS=...`

### Proxy returns 502 Bad Gateway

- Target URL may be unreachable or blocked
- Check Fly.io logs: `flyctl logs`
- Verify the target URL is publicly accessible

## License

MIT

## Author

Created by ishaany83-arch
