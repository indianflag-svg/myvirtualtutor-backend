import express from "express"
import cors from "cors"
import multer from "multer"
import OpenAI from "openai"

const app = express()
const upload = multer({ storage: multer.memoryStorage() })

app.use(cors({
  origin: "*",
  methods: ["GET","POST","OPTIONS"],
  allowedHeaders: ["Content-Type"]
}))

app.use(express.json())

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

/* SIMPLE IN-MEMORY SESSION STORE */

const sessions = {}

/* HEALTH CHECK */

app.get("/", (req,res)=>{
  res.send("MyVirtualTutor backend running")
})

/* CHAT TUTOR */

app.post("/chat", async (req,res)=>{

  const { message, session_id } = req.body

  const sid = session_id || "default"

  if(!sessions[sid]){
    sessions[sid] = {
      step:0,
      problem:null,
      expected:null
    }
  }

  const state = sessions[sid]

  /* NEW PROBLEM */

  if(state.problem === null){

    state.problem = message
    state.step = 1
    state.expected = "4"   // simple example logic

    return res.json({
      ok:true,
      steps:[
        message,
        "What number should we subtract from both sides?"
      ]
    })

  }

  /* STUDENT ANSWER */

  if(state.step === 1){

    if(message.trim() === state.expected){

      state.step = 2
      state.expected = "2"

      return res.json({
        ok:true,
        steps:[
          "2x = 6",
          "What number should we divide by?"
        ]
      })

    }else{

      return res.json({
        ok:true,
        steps:[
          "Not quite. Look at the +4 in the equation.",
          "What number should we subtract?"
        ]
      })

    }

  }

  /* SECOND STEP */

  if(state.step === 2){

    if(message.trim() === state.expected){

      delete sessions[sid]

      return res.json({
        ok:true,
        steps:[
          "x = 3"
        ]
      })

    }else{

      return res.json({
        ok:true,
        steps:[
          "Check the coefficient of x.",
          "What should we divide by?"
        ]
      })

    }

  }

})

/* PHOTO SOLVER (unchanged) */

app.post("/solve-photo", upload.single("image"), async (req,res)=>{

  if(!req.file){
    return res.json({
      ok:false,
      steps:["No image uploaded."]
    })
  }

  try{

    const base64 = req.file.buffer.toString("base64")

    const completion = await client.chat.completions.create({
      model:"gpt-4o-mini",
      messages:[
        {
          role:"system",
          content:`
You are a math tutor reading a worksheet image.

Solve using whiteboard-style steps.

Return JSON:

{
 "steps":[
  "step1",
  "step2"
 ]
}
`
        },
        {
          role:"user",
          content:[
            {
              type:"text",
              text:"Solve the math problems in this worksheet image."
            },
            {
              type:"image_url",
              image_url:{
                url: `data:image/png;base64,${base64}`
              }
            }
          ]
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

    res.json({ ok:true, steps })

  }catch(error){

    console.error(error)

    res.json({
      ok:false,
      steps:["Tutor could not read the image."]
    })

  }

})

const PORT = process.env.PORT || 10000

app.listen(PORT,()=>{
  console.log("Server listening on",PORT)
})
