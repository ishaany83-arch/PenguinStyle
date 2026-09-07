const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS to allow incoming traffic from any origin
app.use(cors());

// Serve static frontend assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Platform health checks endpoint
app.get('/status', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

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

  const proxy = createProxyMiddleware({
    target: parsedTarget.origin,
    changeOrigin: true,
    followRedirects: true,
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
        if (!res.headersSent) {
          res.status(502).json({ error: 'Proxy Request Failed', details: err.message });
        }
      }
    }
  });

  return proxy(req, res, next);
});

app.listen(PORT, () => {
  console.log(`Web proxy server listening on port ${PORT}`);
});
