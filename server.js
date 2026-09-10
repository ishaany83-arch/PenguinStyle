const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || 30),
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS to allow incoming traffic from any origin
app.use(cors());

// Apply rate limiting to all routes
app.use(limiter);

// Serve static frontend assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse request body sizes
app.use(express.json({ limit: process.env.PROXY_SIZE_LIMIT || '10mb' }));
app.use(express.urlencoded({ limit: process.env.PROXY_SIZE_LIMIT || '10mb' }));

// Platform health checks endpoint
app.get('/status', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Security: Block access to sensitive hosts
const BLOCKED_HOSTS = (process.env.BLOCKED_HOSTS || 'localhost,127.0.0.1,0.0.0.0').split(',').map(h => h.trim());

// Whitelist: Only allow specified domains (if configured)
const ALLOWED_HOSTS = process.env.ALLOWED_HOSTS 
  ? process.env.ALLOWED_HOSTS.split(',').map(h => h.trim())
  : null; // null = allow all (except blocked)

const isHostAllowed = (urlString) => {
  try {
    const url = new URL(urlString);
    const hostname = url.hostname;

    // First check blocked hosts
    if (BLOCKED_HOSTS.some(host => hostname.includes(host))) {
      return false;
    }

    // If whitelist is configured, check if host is in it
    if (ALLOWED_HOSTS) {
      return ALLOWED_HOSTS.some(host => 
        hostname === host || hostname.endsWith('.' + host)
      );
    }

    // If no whitelist, allow (except blocked)
    return true;
  } catch {
    return false; // Block invalid URLs
  }
};

// Middleware route /game-tunnel that accepts a target URL via query parameter (?url=)
app.use('/game-tunnel', (req, res, next) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).json({ error: 'Missing target URL query parameter "?url="' });
  }

  let parsedTarget;
  try {
    parsedTarget = new URL(targetUrl);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL parameter provided' });
  }

  // Check if host is allowed
  if (!isHostAllowed(targetUrl)) {
    return res.status(403).json({ error: 'Access to this host is not allowed' });
  }

  const proxy = createProxyMiddleware({
    target: parsedTarget.origin,
    changeOrigin: true,
    followRedirects: true,
    timeout: parseInt(process.env.PROXY_TIMEOUT || 30000),
    proxyTimeout: parseInt(process.env.PROXY_TIMEOUT || 30000),
    pathRewrite: (pathStr, req) => {
      return parsedTarget.pathname + parsedTarget.search;
    },
    on: {
      proxyRes: (proxyRes) => {
        // Delete X-Frame-Options and Content-Security-Policy headers
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
        delete proxyRes.headers['content-security-policy-report-only'];

        // Inject Cache-Control header for successful responses to aggressively preserve host bandwidth
        if (proxyRes.statusCode >= 200 && proxyRes.statusCode < 300) {
          proxyRes.headers['cache-control'] = 'public, max-age=604800, immutable';
        }
      },
      error: (err, req, res) => {
        console.error('Proxy error:', err.message);
        if (!res.headersSent) {
          res.status(502).json({
            error: 'Proxy Request Failed',
            details: err.message,
            timestamp: new Date().toISOString(),
          });
        }
      },
    },
  });

  return proxy(req, res, next);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`Web proxy server listening on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Status: http://localhost:${PORT}/status`);
  if (ALLOWED_HOSTS) {
    console.log(`Whitelist enabled: ${ALLOWED_HOSTS.join(', ')}`);
  }
});
