const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });

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
    .replace(/###/g, "")
    .replace(/\n\s*\n/g, "\n") // remove blank lines
}

app.get("/", (req, res) => {
  res.send("Backend working");
});

app.post("/chat", upload.single("file"), async (req, res) => {
  const message = req.body.message || "";
  const sessionId = req.body.sessionId || "default";

  let inputText = message;

  if (req.file) {
    const fileText = req.file.buffer.toString("utf-8");
    inputText += "\n" + fileText;
  }

  if (!sessions[sessionId]) sessions[sessionId] = [];

  sessions[sessionId].push({ role: "user", content: inputText });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a friendly math tutor.

Rules:
- Solve step-by-step
- Use: Step 1, Step 2 (no markdown)
- Plain text only
- Keep it clean and simple
- If input is messy, extract the problem first
`
        },
        ...sessions[sessionId]
      ]
    });

    let reply = clean(response.choices[0].message.content);

    sessions[sessionId].push({ role: "assistant", content: reply });

    res.json({ ok: true, reply });

  } catch {
    res.json({ ok: false, reply: "OpenAI error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
