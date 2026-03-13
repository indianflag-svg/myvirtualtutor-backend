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

app.post("/chat",(req,res)=>{

  const message = req.body.message

  if(!message){
    return res.json({
      ok:true,
      reply:"Please ask a math question."
    })
  }

  const text = String(message).toLowerCase().trim()

  if(text==="hi" || text==="hello"){
    return res.json({
      ok:true,
      reply:"Hi! I'm your math tutor. What problem would you like help with?"
    })
  }

  if(text==="2+2" || text==="2 + 2"){
    return res.json({
      ok:true,
      reply:"2 + 2 = 4"
    })
  }

  return res.json({
    ok:true,
    reply:"Let's solve that together. What math problem are you working on?"
  })

})

const PORT = process.env.PORT || 10000

app.listen(PORT,()=>{
  console.log("Server listening on",PORT)
})
