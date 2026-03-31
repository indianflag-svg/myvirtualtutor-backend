const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
  res.send("Backend working");
});

app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: "You are a math tutor. Explain step-by-step in plain English. Do NOT use LaTeX, special symbols, or brackets like \\( \\) or \\[ \\]. Keep it clean and easy to read." 
        },
        { role: "user", content: message }
      ]
    });

    res.json({
      ok: true,
      reply: response.choices[0].message.content
    });

  } catch (err) {
    res.json({
      ok: false,
      reply: "OpenAI error"
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
