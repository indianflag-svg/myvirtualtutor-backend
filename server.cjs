import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import { fetch } from "undici";

const app = express();
app.use(express.json());
app.set("trust proxy", 1);

const PORT = process.env.PORT || 3001;

// Allow ALL origins temporarily (for development)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.get("/", (req, res) => {
  res.send("MyVirtualTutor backend running");
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
});

app.post("/chat", chatLimiter, async (req, res) => {
  try {

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "OPENAI_API_KEY missing" });
    }

    const message = String(req.body?.message || "").trim();

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: "You are a helpful math tutor for grades 6-12. Explain answers clearly and step-by-step."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await r.json();

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      "I couldn't generate a response.";

    res.json({ ok: true, reply: text });

  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
