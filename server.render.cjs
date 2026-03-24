const express = require("express")
const cors = require("cors")
const OpenAI = require("openai")

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message

  try {
    const response = await client.responses.create({
      model: "gpt-4o",
      input: `Solve step-by-step and explain clearly:\n${userMessage}`
    })

    let reply = response.output_text || "Tutor had trouble solving that."

    reply += "\n\nDoes that make sense, or do you want me to explain any step?"

    res.json({ reply })

  } catch (err) {
    console.error("OPENAI ERROR:", err.message)
    res.json({ reply: "Error: " + err.message })
  }
})

app.get("/", (req, res) => {
  res.send("MyVirtualTutor backend running")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
