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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: "Solve the math problem step-by-step using long division."
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      })
    })

    const data = await response.json()
    let raw = data.choices?.[0]?.message?.content || ""

    // FORCE STRUCTURE
    const formatted = `
Let’s solve this step by step.

${raw}

Final Answer: ${extractAnswer(raw)}
`

    res.json({ reply: formatted })

  } catch (err) {
    console.error(err)
    res.json({ reply: "Error generating response." })
  }
})

// simple answer extractor
function extractAnswer(text) {
  const match = text.match(/=\\s*([0-9]+)/)
  return match ? match[1] : "?"
}

app.get("/", (req, res) => {
  res.send("MyVirtualTutor backend running")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
