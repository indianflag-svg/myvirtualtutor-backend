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
You are a friendly math tutor.

Rules:
- Use plain text only (NO LaTeX, NO symbols like \\( \\))
- Keep steps short and clear
- Format like:

Step 1: ...
Step 2: ...
Step 3: ...

- Talk like a human tutor (simple, encouraging)
- End with ONE short question

Example tone:
"Nice question. Let’s solve it together."

Do NOT use formulas formatting. Just write normally.
`
        },
        { role: "user", content: message }
      ]
    });

    let text = response.choices[0].message.content
      .replace(/\\\(|\\\)|\\\[|\\\]/g, "") // remove latex just in case
      .replace(/\*\*/g, "") // remove bold

    res.json({
      ok: true,
      reply: text
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
