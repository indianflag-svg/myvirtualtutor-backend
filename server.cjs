const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

/* ---------- CORS ---------- */
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  })
);

/* ---------- storage setup ---------- */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `whiteboard-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

/* ---------- OpenAI helper ---------- */
async function explainWhiteboardImage({ base64Png, promptText }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY env var");

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: promptText },
              {
                type: "input_image",
                image_url: `data:image/png;base64,${base64Png}`,
              },
            ],
          },
        ],
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      const msg =
        json?.error?.message ||
        json?.message ||
        `OpenAI error (${res.status})`;
      throw new Error(msg);
    }

    // Responses API includes aggregated text on output_text in SDKs;
    // in raw JSON, it’s typically present as json.output_text too.
    const text =
      json.output_text ||
      (Array.isArray(json.output)
        ? json.output
            .filter((o) => o.type === "message")
            .flatMap((o) => o.content || [])
            .filter((c) => c.type === "output_text")
            .map((c) => c.text)
            .join("\n")
        : "");

    return text || "I couldn't extract text from the model response.";
  } finally {
    clearTimeout(t);
  }
}

/* ---------- routes ---------- */
app.get("/health", (_, res) => {
  res.json({ ok: true, service: "myvirtualtutor-backend" });
});

app.post("/whiteboard/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: "No file received" });
  console.log("[upload] saved:", req.file.filename);
  res.json({ ok: true, file: req.file.filename });
});

app.post("/whiteboard/ask", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: "No file received" });

    const filePath = path.join(uploadDir, req.file.filename);
    const bytes = fs.statSync(filePath).size;
    console.log("[ask] received:", req.file.filename, "bytes:", bytes);

    const base64Png = fs.readFileSync(filePath, "base64");

    const promptText =
      "You are a math tutor for grades 3–8. Look at the whiteboard image and explain what the student wrote/drew. " +
      "If it’s a math problem, solve it step-by-step. If it’s unclear, ask 1–2 clarifying questions. Keep it concise.";

    const explanation = await explainWhiteboardImage({ base64Png, promptText });

    res.json({ ok: true, file: req.file.filename, explanation });
  } catch (err) {
    res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
});

/* ---------- start ---------- */
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
