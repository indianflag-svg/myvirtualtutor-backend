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
You are a math tutor for a middle school student.

You MUST follow this EXACT structure. Do NOT skip steps.

Solve using LONG DIVISION ONLY.

RESPONSE FORMAT (follow exactly):

Let’s solve this step by step using long division.

Step 1: Look at the first part of the number and explain what we are doing  
Step 2: Divide and explain how many times it goes in  
Step 3: Multiply and show the result  
Step 4: Subtract and explain  
Step 5: Bring down the next number  
Step 6: Repeat until done  

Final Answer: ___

IMPORTANT:
- Do NOT jump to the answer
- Do NOT list multiples
- Do NOT shorten the explanation
- Always explain like teaching a beginner

Problem:
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
        temperature: 0.3,
        messages: [
          { role: "system", content: "You are a strict math tutor that always follows instructions." },
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
