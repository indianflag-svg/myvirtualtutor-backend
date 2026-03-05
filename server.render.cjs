/* server.render.cjs
   Render/CommonJS entrypoint
   - POST /session        -> mints realtime client secret (JSON)
   - POST /webrtc/answer  -> exchanges WebRTC SDP offer for SDP answer (application/sdp)
*/

require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// ---------- Config ----------
const PORT = Number(process.env.PORT || 10000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in environment");
  process.exit(1);
}

// allow both apex + www + (optional) vercel preview
const ALLOWED_ORIGINS = new Set([
  "https://myvirtualtutor.com",
  "https://www.myvirtualtutor.com",
  "https://myvirtualtutor-frontend.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function isAllowedVercelSubdomain(origin) {
  try {
    const u = new URL(origin);
    return (
      u.protocol === "https:" &&
      u.hostname.endsWith(".vercel.app") &&
      (u.hostname === "myvirtualtutor-frontend.vercel.app" ||
        u.hostname.startsWith("myvirtualtutor-frontend-"))
    );
  } catch {
    return false;
  }
}

function originAllowed(origin) {
  return ALLOWED_ORIGINS.has(origin) || isAllowedVercelSubdomain(origin);
}

// ---------- CORS ----------
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (originAllowed(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.options("*", cors());

// ---------- Body parsing ----------
app.use(express.json({ limit: "1mb" }));

// ---------- Debug log ----------
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} CT=${req.headers["content-type"] || ""}`
  );
  next();
});

// ---------- Routes ----------
app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/session", async (req, res) => {
  try {
    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions:
            "You are MyVirtualTutor, a professional math tutor for grades 3-8.",
          audio: { output: { voice: "marin" } },
        },
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post(
  "/webrtc/answer",
  express.text({ type: ["application/sdp", "text/plain"], limit: "2mb" }),
  async (req, res) => {
    const offer = req.body || "";
    console.log("[SDP] length:", offer.length);

    if (!offer.includes("v=0")) {
      return res.status(400).send("Missing/invalid SDP offer");
    }

    const fd = new FormData();
    fd.set("sdp", offer);
    fd.set(
      "session",
      JSON.stringify({
        type: "realtime",
        model: "gpt-realtime",
        audio: { output: { voice: "marin" } },
      })
    );

    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: fd,
    });

    if (!r.ok) return res.status(r.status).send(await r.text());
    res.type("application/sdp").send(await r.text());
  }
);

app.listen(PORT, "0.0.0.0", () =>
  console.log("Server listening on", PORT)
);
