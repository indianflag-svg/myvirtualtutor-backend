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
          content: `
You are a calm, friendly math tutor.

Teach like a real tutor:
- Use short sentences
- Guide step-by-step
- Use "Step 1:", "Step 2:"
- Ask ONE small guiding question at the end
- Keep it simple (middle school level)
- No long paragraphs
`
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
