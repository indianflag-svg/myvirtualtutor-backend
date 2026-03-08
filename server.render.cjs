require("dotenv").config();

const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

const PORT = Number(process.env.PORT || 10000);
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/session", async (req, res) => {
  try {

    const session = await client.beta.realtime.sessions.create({
      model: "gpt-realtime",
      instructions: "You are MyVirtualTutor, a math tutor that teaches step by step.",
      voice: "marin"
    });

    res.json(session);

  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on", PORT);
});
