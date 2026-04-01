const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const sessions = {};

function clean(text) {
  return text
    .replace(/\\\(|\\\)|\\\[|\\\]/g, "")
    .replace(/\\frac{([^}]*)}{([^}]*)}/g, "$1/$2")
    .replace(/\*\*/g, "")
}

app.get("/", (req, res) => {
  res.send("Backend working");
});

app.post("/chat", async (req, res) => {
  const { message, sessionId } = req.body;
  const id = sessionId || "default";

  if (!sessions[id]) sessions[id] = [];

  sessions[id].push({ role: "user", content: message });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a friendly math tutor.

Rules:
- Plain text only (no LaTeX)
- Step-by-step
- Keep it simple
- Solve directly
`
        },
        ...sessions[id]
      ]
    });

    let reply = clean(response.choices[0].message.content);

    sessions[id].push({ role: "assistant", content: reply });

    res.json({ ok: true, reply });

  } catch {
    res.json({ ok: false, reply: "OpenAI error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
