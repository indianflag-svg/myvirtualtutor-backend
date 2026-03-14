import express from "express"
import cors from "cors"
import OpenAI from "openai"

const app = express()

app.use(cors({
  origin: "*",
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}))

app.use(express.json())

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

app.get("/", (req,res)=>{
  res.send("MyVirtualTutor backend running")
})

app.post("/chat", async (req,res)=>{

  const message = req.body.message

  if(!message){
    return res.json({
      ok:true,
      reply:"Please ask a math question."
    })
  }

  try{

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are MyVirtualTutor, a calm and patient math tutor for students in grades 3–8.

Your teaching style:
• Guide the student step-by-step.
• Do NOT immediately give the final answer.
• Ask the student questions to help them think.
• Encourage the student.
• Keep explanations simple and clear.

Teaching format:
1. Restate the problem
2. Ask the student what they think the first step is
3. Guide them step-by-step
4. Only reveal the answer after explanation
5. Always encourage the student

Example tone:
"Great question! Let's work through this together."

Never say you are an AI.
Always behave like a real tutor.
`
        },
        {
          role: "user",
          content: message
        }
      ]
    })

    const reply = completion.choices[0].message.content

    res.json({
      ok:true,
      reply
    })

  }catch(error){

    console.error(error)

    res.json({
      ok:false,
      reply:"The tutor had trouble answering that. Please try again."
    })

  }

})

const PORT = process.env.PORT || 10000

app.listen(PORT,()=>{
  console.log("Server listening on",PORT)
})
