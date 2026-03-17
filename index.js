import express from "express"
import cors from "cors"
import fetch from "node-fetch"

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message

  try {
    const prompt = `
You are a friendly math tutor helping a student.

IMPORTANT RULES:
- Always solve division problems using LONG DIVISION (not listing multiples)
- Teach step-by-step like a real tutor
- Speak clearly and simply
- Explain WHY each step happens
- Be conversational, not robotic

FORMAT:

Start with:
"Let’s solve this step by step using long division."

Then explain each step clearly:
- What number we look at
- How many times it goes in
- Multiply
- Subtract
- Bring down

End with:
"Final Answer: ___"

Now solve:
${userMessage}
`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": \`Bearer \${process.env.OPENAI_API_KEY}\`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a helpful math tutor." },
          { role: "user", content: prompt }
        ]
      })
    })

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || "Error"

    res.json({ reply })

  } catch (err) {
    console.error(err)
    res.json({ reply: "Error generating response." })
  }
})

app.get("/", (req, res) => {
  res.send("MyVirtualTutor backend running")
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})
