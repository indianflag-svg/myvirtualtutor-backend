require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT = Number(process.env.PORT || 10000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in environment");
  process.exit(1);
}

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

function toASCII(str) {
  return Buffer.from(str, "ascii").toString("ascii");
}

app.post("/session", async (req, res) => {
  try {

    const body = {
      session: {
        type: "realtime",
        model: "gpt-realtime",
        instructions: toASCII("You are MyVirtualTutor, a math tutor that teaches step by step."),
        audio: {
          output: { voice: "marin" }
        }
      }
    };

    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on", PORT);
});
