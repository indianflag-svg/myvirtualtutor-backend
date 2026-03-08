require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = Number(process.env.PORT || 10000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(express.json());

/* ---------- HEALTH ---------- */

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

/* ---------- CHAT (used by frontend) ---------- */

app.post("/chat", async (req, res) => {
  try {

    const message = req.body.message || "";

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are MyVirtualTutor, a professional math tutor. Teach step-by-step clearly like a human tutor."
          },
          {
            role: "user",
            content: message
          }
        ]
      },
      {
        headers: {
          Authorization: "Bearer " + OPENAI_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    const reply = response.data.choices[0].message.content;

    res.json({ reply });

  } catch (err) {

    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message
    });

  }
});

/* ---------- REALTIME SESSION (future voice tutor) ---------- */

app.post("/session", async (req, res) => {
  try {

    const body = {
      session: {
        type: "realtime",
        model: "gpt-realtime",
        instructions: "You are MyVirtualTutor. Teach math step by step.",
        audio: {
          output: { voice: "marin" }
        }
      }
    };

    const response = await axios.post(
      "https://api.openai.com/v1/realtime/client_secrets",
      body,
      {
        headers: {
          Authorization: "Bearer " + OPENAI_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (err) {

    console.error(err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message
    });

  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on", PORT);
});
