import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();

const PORT = Number(process.env.PORT || 3002);
const WEB_ORIGIN = process.env.WEB_ORIGIN || "http://localhost:3000";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const REALTIME_MODEL = process.env.REALTIME_MODEL || "gpt-realtime-mini-2025-12-15";
  process.env.REALTIME_MODEL || "gpt-realtime-mini-2025-12-15";
  const REALTIME_VOICE = process.env.REALTIME_VOICE || "marin";

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in server/.env");
  process.exit(1);
}
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log(`Allowed origin(s): ${WEB_ORIGIN}`);
})
// Accept raw SDP offer text
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

// Safari-safe CORS (handles preflight)
const allowedOrigins = new Set([
  WEB_ORIGIN,
  "http://localhost:3000",
  "http://127.0.0.1:3000"
]);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // allow curl / local tools
    if (allowedOrigins.has(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/session", async (req, res) => {
  try {
    const sdpOffer = req.body;
    if (!sdpOffer || typeof sdpOffer !== "string") {
      return res.status(400).send("Missing SDP offer in request body.");
    }

    const session = {
      type: "realtime",
      model: REALTIME_MODEL,
      audio: { output: { voice: REALTIME_VOICE } }
    };

    const fd = new FormData();
    fd.set("sdp", sdpOffer);
    fd.set("session", JSON.stringify(session));

    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: fd
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(r.status).send(errText);
    }

    const sdpAnswer = await r.text();
    res.setHeader("Content-Type", "application/sdp");
    return res.status(200).send(sdpAnswer);
  } catch (e) {
    console.error(e);
    return res.status(500).send("Server error creating realtime session.");
  }
  console.log(`Backend: http://localhost:${PORT}`);
  console.log(`Allowed origin(s): ${Array.from(allowedOrigins).join(", ")}`);
});

