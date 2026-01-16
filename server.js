'use strict';

const express = require('express');
const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 10000;

const ALLOWED_ORIGINS = new Set([
  'https://myvirtualtutor-frontend.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (origin) res.setHeader('Vary', 'Origin');
  if (!origin) return true;
  if (!ALLOWED_ORIGINS.has(origin)) return false;

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  return true;
}

// Preflight can never fail now
app.options('*', (req, res) => {
  if (!applyCors(req, res)) {
    return res.status(403).json({ error: `CORS blocked for origin: ${req.headers.origin}` });
  }
  return res.sendStatus(204);
});

app.use((req, res, next) => {
  if (!applyCors(req, res)) {
    return res.status(403).json({ error: `CORS blocked for origin: ${req.headers.origin}` });
  }
  next();
});

app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ ok: true, version: "613e38d" }));

app.post('/session', (req, res) => {
  res.json({ ok: true, message: 'Preflight fixed; /session reachable' });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Allowed origins: ${Array.from(ALLOWED_ORIGINS).join(', ')}`);
});
