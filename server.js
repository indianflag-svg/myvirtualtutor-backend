const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// simple in-memory history
let history = [];

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
          content: "You are a math tutor. Teach step-by-step. Remember previous messages."
        },
        ...history
      ]
    });

    const reply = response.choices[0].message.content;

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
