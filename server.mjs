import "dotenv/config"
import express from "express"

const app = express()
app.use(express.json())

const PORT = 3001

app.get("/", (req,res)=>{
  res.send("MyVirtualTutor backend running")
})

app.post("/chat", async (req,res)=>{

  try{

    const response = await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        model:"gpt-4.1-mini",
        messages:[
          {
            role:"system",
            content:"You are a friendly math tutor. Explain answers step-by-step."
          },
          {
            role:"user",
            content:req.body.message
          }
        ]
      })
    })

    const data = await response.json()

    const reply = data.choices?.[0]?.message?.content || "No response from OpenAI"

    res.json({
      ok:true,
      reply:reply
    })

  }catch(err){

    res.json({
      ok:false,
      error:String(err)
    })

  }

})

app.listen(PORT, ()=>{
  console.log("Server running on port",PORT)
})
