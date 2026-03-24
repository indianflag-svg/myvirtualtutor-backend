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
        input: `Solve step-by-step:\n${userMessage}`
      })
    })

    const data = await response.json()

    // 🔥 LOG ERROR CLEARLY
    if (data.error) {
      console.error("OPENAI ERROR:", data.error)
      return res.json({ reply: "ERROR: " + data.error.message })
    }

    let reply = data.output?.[0]?.content?.[0]?.text || "No response"

    reply += "\n\nDoes that make sense, or do you want me to explain any step?"

    res.json({ reply })

  } catch (err) {
    console.error("SERVER ERROR:", err)
    res.json({ reply: "Server crashed." })
  }
})

app.get("/", (req, res) => {
  res.send("MyVirtualTutor backend running")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
