const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(morgan('dev'));

// Safe logging middleware (does not consume the body stream)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl} | Headers:`, req.headers);
  next();
});

// Health check and test routes (parse JSON for these)
app.use('/health', express.json({ limit: '10mb' }));
app.use('/test', express.json({ limit: '10mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Test route to verify body parsing in gateway
app.post('/test', (req, res) => {
  res.json({ received: req.body });
});

// Proxy configuration with timeouts
const proxyOptions = {
  changeOrigin: true,
  timeout: 30000, // 30 seconds timeout
  proxyTimeout: 30000,
  onError: (err, req, res) => {
    console.error(`Proxy error for ${req.originalUrl}:`, err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Proxy error', details: err.message });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.originalUrl} to ${proxyReq.path}`);
    
    // If there's a body, we need to handle it properly for the proxy
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Received response for ${req.originalUrl}: ${proxyRes.statusCode}`);
  }
};

// Parse JSON for API routes before proxying
app.use('/api', express.json({ limit: '10mb' }));
app.use('/api', express.urlencoded({ extended: true, limit: '10mb' }));

// Proxy /api/playlists to playlist-service
app.use('/api/playlists', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://playlist-service:3001'
}));

// Proxy /api/users to user-service
app.use('/api/users', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://user-service:3002'
}));

// Proxy /api/auth to user-service
app.use('/api/auth', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://user-service:3002'
}));

// Proxy /api/music to music-service
app.use('/api/music', createProxyMiddleware({
  ...proxyOptions,
  target: 'http://music-service:3003'
}));

// Proxy /uploads to music-service for audio/image files
app.use('/uploads', createProxyMiddleware({
  target: 'http://music-service:3003',
  changeOrigin: true,
  pathRewrite: { '^/uploads': '/uploads' }
}));

// TODO: Add proxies for /api/admin

// Explicitly handle OPTIONS for all /api/* routes to support CORS preflight
app.options('/api/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.sendStatus(204);
});

app.listen(3000, () => {
  console.log('API Gateway running on port 3000');
}); 