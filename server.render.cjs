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
// WebRTC SDP answer (server-side call to OpenAI)
// Frontend sends raw SDP offer as request body (Content-Type: application/sdp)
app.post(
  "/webrtc/answer",
  express.text({ type: ["application/sdp", "text/plain"], limit: "5mb" }),
  async (req, res) => {
    try {
      const offerSdp = (typeof req.body === "string" ? req.body : "").trim();
      if (!offerSdp.startsWith("v=")) {
        return res.status(400).type("text/plain").send("Missing/invalid SDP offer");
      }

      if (!OPENAI_API_KEY) {
        return res.status(500).type("text/plain").send("OPENAI_API_KEY is not set");
      }

      const fd = new FormData();
      fd.set("sdp", offerSdp);
      fd.set(
        "session",
        JSON.stringify({
          type: "realtime",
          model: "gpt-4o-realtime-preview",
          instructions: "You are MyVirtualTutor. Respond in plain text.",
          audio: { output: { voice: "marin" } },
        })
      );

      const r = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: fd,
      });

      const text = await r.text();
      if (!r.ok) return res.status(r.status).type("text/plain").send(text);

      res.setHeader("Content-Type", "application/sdp");
      return res.status(200).send(text);
    } catch (err) {
      return res.status(500).type("text/plain").send(String(err?.message || err));
    }
  }
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Allowed origin(s): ${Array.from(allowedSet).join(", ")}`);
});
