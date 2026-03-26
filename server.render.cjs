const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
  res.send("MyVirtualTutor backend running")
})

app.post("/chat", async (req, res) => {
  const { message } = req.body

  if (!message) {
    return res.status(400).json({ ok: false, reply: "No message provided" })
  }

  try {
    // simple math handling (MVP)
    let result
    try {
      result = eval(message)
    } catch {
      result = null
    }

    if (result !== null && result !== undefined) {
      return res.json({
        ok: true,
        reply: String(result)
      })
    }

    return res.json({
      ok: true,
      reply: "Tutor is thinking... (LLM not connected yet)"
    })

  } catch (err) {
    return res.status(500).json({
      ok: false,
      reply: "Server error"
    })
  }
})

const PORT = process.env.PORT || 10000
app.listen(PORT, () => {
  console.log("Server listening on " + PORT)
})
