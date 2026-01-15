'use strict';

const express = require('express');
const cors = require('cors');

const app = express();
app.set("trust proxy", 1);

// Hard-stop preflight early so it can never throw
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  return res.sendStatus(204);
});

const PORT = process.env.PORT || 10000;

// ✅ Add your Vercel frontend here
const ALLOWED_ORIGINS = new Set([
  'https://myvirtualtutor-frontend.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function corsOrigin(origin, callback) {
  // Allow curl/server-to-server (no Origin header)
  if (!origin) return callback(null, true);

  if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);

  return callback(new Error(`CORS blocked for origin: ${origin}`));
}

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.options('*', cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '1mb' }));

app.

git add server.js
git commit -m "Fix CORS for Vercel frontend"
git push

curl -i -X OPTIONS https://myvirtualtutor-backend.onrender.com/session \
  -H "Origin: https://myvirtualtutor-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST"

EOFD
