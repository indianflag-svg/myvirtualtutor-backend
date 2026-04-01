const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let history = [];

function clean(text) {
  return text
    .replace(/\\\(|\\\)|\\\[|\\\]/g, "")
    .replace(/\*\*/g, "")
}

app.get("/", (req, res) => {
  res.send("Backend working");
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  history.push({ role: "user", content: message });

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a friendly math tutor.

Rules:
- Always solve directly
- Use Step 1, Step 2 format
- Plain text only (no LaTeX)
- Keep it short and clear
`
        },
        ...history
      ]
    });

    let reply = clean(response.choices[0].message.content);

    history.push({ role: "assistant", content: reply });

    res.json({ ok: true, reply });

  } catch {
    res.json({ ok: false, reply: "OpenAI error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
