'use strict';

import express from "express";

const app = express();
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = new Set([
  'https://myvirtualtutor-frontend.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function isAllowedVercelSubdomain(origin) {
  try {
    const u = new URL(origin);
    return (
      u.protocol === 'https:' &&
      u.hostname.endsWith('.vercel.app') &&
      (u.hostname === 'myvirtualtutor-frontend.vercel.app' ||
        u.hostname.startsWith('myvirtualtutor-frontend-'))
    );
  } catch {
    return false;
  }
}

function originAllowed(origin) {
  return ALLOWED_ORIGINS.has(origin) || isAllowedVercelSubdomain(origin);
}

// Manual CORS middleware (handles preflight explicitly)
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Always vary on Origin when we set allow-origin dynamically
  if (origin) res.setHeader('Vary', 'Origin');

  // Allow non-browser/server-to-server calls (no Origin header) to pass through
  if (!origin) {
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  }

  if (!originAllowed(origin)) {
    // Block unknown origins clearly (browser will show CORS error)
    if (req.method === 'OPTIONS') {
      return res.status(403).json({ error: `CORS blocked for origin: ${origin}` });
    }
    return res.status(403).json({ error: `CORS blocked for origin: ${origin}` });
  }

  // Allowed origin: set headers
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Preflight should end here
  if (req.method === 'OPTIONS') return res.sendStatus(204);

  next();
});

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const origin = req.headers.origin || '';
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} Origin=${origin}`);
  next();
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true, service: "myvirtualtutor-backend", version: "render-check-2026-01-20-a", ts: new Date().toISOString() });
});

app.post("/session", async (req, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "OPENAI_API_KEY is not set" });
    }

    const {
      model = "gpt-realtime",
      voice = "marin",
      modalities = undefined, // e.g. ["text"] for text-only
    } = req.body || {};

    const sessionConfig = {
      session: {
        type: "realtime",
        model: typeof model === "string" ? model : "gpt-realtime",
        ...(Array.isArray(modalities) ? { modalities } : {}),
        audio: {
          output: { voice: typeof voice === "string" ? voice : "marin" },
        },
      },
    };

    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionConfig),
    });

    const data = await r.json().catch(() => null);

    if (!r.ok) {
      return res.status(r.status).json({
        ok: false,
        error: "Failed to mint realtime client secret",
        details: data,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ ok: false, error: String(err?.message || err) });
  }
});


// Render verification route
app.get("/whoami", (req, res) => {
  res.json({
    ok: true,
    repo: "indianflag777/myvirtualtutor-backend",
    file: "server.js",
    marker: "whoami-2026-01-20-a"
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log('Allowed origins:', Array.from(ALLOWED_ORIGINS).join(', '));
});
// Render verification route

// WHOAMI MARKER: whoami-2026-01-20-b
app.get("/whoami", (req, res) => {
  res.json({ ok: true, marker: "whoami-2026-01-20-b" });
});

