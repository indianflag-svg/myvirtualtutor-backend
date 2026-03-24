const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message

  // HARD TEST RESPONSE
  res.json({
    reply: "TEST WORKING\n\nDoes that make sense, or do you want me to explain any step?"
  })
})

app.get("/", (req, res) => {
  res.send("MyVirtualTutor backend running")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
