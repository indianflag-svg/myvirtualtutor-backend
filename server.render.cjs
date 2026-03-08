require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = Number(process.env.PORT || 10000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.post("/session", async (req, res) => {
  try {

    const body = {
      session: {
        type: "realtime",
        model: "gpt-realtime",
        instructions: "You are MyVirtualTutor. Teach math step by step.",
        audio: { output: { voice: "marin" } }
      }
    };

    const json = JSON.stringify(body);

    // DEBUG: print every character code so we can see if 8217 appears
    const codes = [...json].map(c => c.charCodeAt(0));
    console.log("JSON body:", json);
    console.log("Char codes:", codes);

    const response = await fetch(
      "https://api.openai.com/v1/realtime/client_secrets",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: json
      }
    );

    const data = await response.text();
    res.send(data);

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log("Server listening on", PORT);
});
