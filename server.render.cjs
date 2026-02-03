'use strict';

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = Number(process.env.PORT || 10000);

// Comma-separated list, e.g. "https://www.myvirtualtutor.com,https://myvirtualtutor.com"
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://127.0.0.1:3000")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const allowedSet = new Set(ALLOWED_ORIGINS);

app.use(express.text({ type: ["application/sdp", "text/plain"], limit: "5mb" }));

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl/server-to-server
    if (allowedSet.has(origin)) return cb(null, true);
    return cb(null, false); // IMPORTANT: don't throw; just deny
  },
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.options("*", cors());

app.get("/health", (_req, res) => res.json({ ok: true }));

// TODO: keep your existing /session logic here if needed.
// For now, we just keep the service alive + CORS-correct baseline.
app.post("/session", (_req, res) => {
  res.status(501).type("text/plain").send("Session endpoint not wired in server.render.cjs yet.");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Allowed origin(s): ${Array.from(allowedSet).join(", ")}`);
});
