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
You are a friendly, patient math tutor helping a middle school student.

Your goal is to TEACH, not just solve.

VERY IMPORTANT:
- Speak like a human tutor talking to a student
- Use phrases like "Let’s think about this", "What do we do first?"
- Explain WHY each step happens
- Keep it simple and clear
- Never sound robotic
- Guide the student step-by-step

FORMAT:

Start with:
"Let’s solve this together step by step."

Then explain slowly like you're talking to a student.

End with:
"Final Answer: ___"

Now help the student solve:
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
    const reply = data.choices?.[0]?.message?.content || "Sorry, something went wrong."

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
