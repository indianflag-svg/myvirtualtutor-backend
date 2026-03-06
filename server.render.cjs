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

// ---------- Allowed Origins ----------
const ALLOWED_ORIGINS = new Set([
  "https://myvirtualtutor.com",
  "https://www.myvirtualtutor.com",
  "https://myvirtualtutor-frontend.vercel.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function originAllowed(origin) {
  return !origin || ALLOWED_ORIGINS.has(origin);
}

// ---------- CORS ----------
app.use(
  cors({
    origin: (origin, cb) => {
      if (originAllowed(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

// ---------- Body Parsing ----------
app.use(express.json({ limit: "1mb" }));

// ---------- Health ----------
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// ---------- Session Endpoint ----------
app.post("/session", async (req, res) => {
  try {
    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + OPENAI_API_KEY,
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model: "gpt-realtime",
          instructions:
            "You are MyVirtualTutor, a professional math tutor for students in grades 3 to 8. Teach step by step and guide the student to understand the problem.",
          audio: {
            output: { voice: "marin" }
          }
        }
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json(data);
    }

    res.json(data);

  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ---------- WebRTC Answer ----------
app.post(
  "/webrtc/answer",
  express.text({ type: ["application/sdp", "text/plain"], limit: "2mb" }),
  async (req, res) => {
    const offer = req.body || "";

    if (!offer.includes("v=0")) {
      return res.status(400).send("Invalid SDP offer");
    }

    const fd = new FormData();

    fd.set("sdp", offer);

    fd.set(
      "session",
      JSON.stringify({
        type: "realtime",
        model: "gpt-realtime",
        audio: {
          output: { voice: "marin" }
        }
      })
    );

    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + OPENAI_API_KEY
      },
      body: fd
    });

    if (!r.ok) {
      return res.status(r.status).send(await r.text());
    }

    res.type("application/sdp").send(await r.text());
  }
);

// ---------- Start Server ----------
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on", PORT);
});
