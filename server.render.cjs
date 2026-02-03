'use strict';

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = Number(process.env.PORT || 10000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Comma-separated list, e.g. "https://www.myvirtualtutor.com,https://myvirtualtutor.com"
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const allowedSet = new Set(ALLOWED_ORIGINS);

// Parse JSON for /session (client_secrets endpoint)
app.use(express.json({ limit: "1mb" }));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/server-to-server
    if (allowedSet.has(origin)) return cb(null, true);
    return cb(null, false); // deny without throwing
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Mint a Realtime client secret for the browser (matches your working server.js logic)
app.post("/session", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
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
        instructions:
          "You are MyVirtualTutor, a professional math tutor for grades 3–8. Always respond in English. Keep explanations step-by-step, concise, and supportive.",
        audio: {
          output: { voice: typeof voice === "string" ? voice : "marin" },
        },
      },
    };

    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Allowed origin(s): ${Array.from(allowedSet).join(", ")}`);
});
