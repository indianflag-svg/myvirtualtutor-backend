const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000

app.post("/chat", async (req, res) => {
  res.json({ reply: "BACKEND VERSION 2 LIVE" })
})

app.get("/", (req, res) => {
  res.send("BACKEND VERSION 2 ROOT")
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
