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
      steps:["Please ask a math question."]
    })
  }

  try{

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are MyVirtualTutor, a math tutor for grades 3–8.

Solve problems step-by-step.

Return ONLY JSON in this format:

{
 "steps":[
  "step 1",
  "step 2",
  "step 3"
 ]
}

Rules:
• No paragraphs
• No explanations outside the steps
• Each step must be short
• Final step must contain the answer
`
        },
        {
          role: "user",
          content: message
        }
      ]
    })

    const raw = completion.choices[0].message.content

    let steps

    try{
      const parsed = JSON.parse(raw)
      steps = parsed.steps
    }catch{
      steps = [raw]
    }

    res.json({
      ok:true,
      steps
    })

  }catch(error){

    console.error(error)

    res.json({
      ok:false,
      steps:["The tutor had trouble solving that."]
    })

  }

})

const PORT = process.env.PORT || 10000

app.listen(PORT,()=>{
  console.log("Server listening on",PORT)
})
