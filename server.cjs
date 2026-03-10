import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import { fetch } from "undici";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

/* allow all origins */
app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin","*")
  res.setHeader("Access-Control-Allow-Methods","GET,POST,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers","Content-Type,Authorization")
  if(req.method==="OPTIONS") return res.sendStatus(204)
  next()
})

app.get("/",(req,res)=>{
  res.send("MyVirtualTutor backend running")
})

const limiter = rateLimit({
  windowMs:60000,
  max:20
})

app.post("/chat",limiter,async(req,res)=>{

  try{

    const apiKey = process.env.OPENAI_API_KEY

    const r = await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{
        Authorization:`Bearer ${apiKey}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:"gpt-4.1-mini",
        input:[
          {
            role:"system",
            content:"You are a math tutor. Explain answers step-by-step."
          },
          {
            role:"user",
            content:req.body.message
          }
        ]
      })
    })

    const data = await r.json()

    const text =
      data.output?.[0]?.content?.[0]?.text ||
      "No response"

    res.json({
      ok:true,
      reply:text
    })

  }catch(err){

    res.status(500).json({
      ok:false,
      error:String(err)
    })

  }

})

app.listen(PORT,()=>{
  console.log("Server running on",PORT)
})
