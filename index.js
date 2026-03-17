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
You are a calm, friendly math tutor for students in grades 3–8.

Always teach step-by-step in a clear and simple way.

Rules:
- Start with: "Let’s solve this step by step:"
- Explain what you are doing and why
- Use simple language a child can understand
- Do NOT skip steps
- Avoid sounding like a calculator
- Be encouraging and patient

Format your response like this:

Step 1: Explain what we are looking at  
Step 2: Show the math and explain  
Step 3: Continue step-by-step  
Final Answer: ___

Now solve the problem:
${userMessage}
`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
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
  console.log(`Server running on port ${PORT}`)
})
