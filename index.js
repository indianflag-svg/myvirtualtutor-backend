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
You are a friendly and patient math tutor.

Teach step-by-step using long division.

IMPORTANT:
- Be slightly conversational (like a tutor talking)
- Add small guiding phrases like "Let’s start by..." or "Now we..."
- Keep steps clear and simple
- Do NOT skip steps

FORMAT:

Let’s solve this step by step.

Step 1: Explain what we look at  
Step 2: Divide  
Step 3: Multiply  
Step 4: Subtract  
Step 5: Bring down  
Step 6: Continue  

Final Answer: ___

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
        temperature: 0.4,
        messages: [
          { role: "system", content: "You are a helpful tutor." },
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
