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
          content: "You are a friendly math tutor for grades 3-8. Explain step-by-step so the student learns."
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
