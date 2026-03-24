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
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        input: `Solve this step by step and explain clearly:\n${userMessage}`
      })
    })

    const data = await response.json()

    let reply = data.output?.[0]?.content?.[0]?.text || "Tutor had trouble solving that."

    reply += "\n\nDoes that make sense, or do you want me to explain any step?"

    res.json({ reply })

  } catch (err) {
    console.error(err)
    res.json({ reply: "Tutor had trouble solving that." })
  }
})

app.get("/", (req, res) => {
  res.send("MyVirtualTutor backend running")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
