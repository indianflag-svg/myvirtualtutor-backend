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

const sessions = {}

app.get("/", (req,res)=>{
  res.send("MyVirtualTutor backend running")
})

app.post("/chat", async (req,res)=>{
  const { message, session_id } = req.body
  const sid = session_id || "default"

  if(!sessions[sid]){
    sessions[sid] = {
      mode: null,
      step: 0,
      problem: null
    }
  }

  const state = sessions[sid]
  const input = String(message || "").trim()

  if(!state.problem){
    if(input === "2x + 4 = 10"){
      state.mode = "interactive_algebra"
      state.problem = input
      state.step = 1

      return res.json({
        ok: true,
        steps: [
          "2x + 4 = 10",
          "What number should we subtract from both sides?"
        ]
      })
    }

    try{
      const completion = await client.chat.completions.create({
        model:"gpt-4o-mini",
        messages:[
          {
            role:"system",
            content:`
You are MyVirtualTutor, a teaching-first math tutor for grades 3–8.

Return ONLY JSON:

{
  "steps":[
    "step1",
    "step2"
  ]
}

Rules:
- Use whiteboard-style short lines
- No paragraphs
- No long explanations
- Include the original problem as the first line
- Then show guided solving lines
- Final line should show the answer
`
          },
          {
            role:"user",
            content:input
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

      return res.json({ ok:true, steps })
    }catch(error){
      console.error(error)
      return res.json({
        ok:false,
        steps:["Tutor had trouble solving that."]
      })
    }
  }

  if(state.mode === "interactive_algebra" && state.step === 1){
    if(input === "4"){
      state.step = 2
      return res.json({
        ok:true,
        steps:[
          "2x = 6",
          "Correct.",
          "What number should we divide by?"
        ]
      })
    }

    return res.json({
      ok:true,
      steps:[
        "2x + 4 = 10",
        "Not quite. Look at the +4 in the equation.",
        "What number should we subtract?"
      ]
    })
  }

  if(state.mode === "interactive_algebra" && state.step === 2){
    if(input === "2"){
      delete sessions[sid]
      return res.json({
        ok:true,
        steps:[
          "x = 3",
          "Correct."
        ]
      })
    }

    return res.json({
      ok:true,
      steps:[
        "2x = 6",
        "Not quite. Check the coefficient of x.",
        "What should we divide by?"
      ]
    })
  }

  delete sessions[sid]
  return res.json({
    ok:true,
    steps:["Let's start a new problem."]
  })
})

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

Return ONLY JSON in this format:

{
  "steps":[
    "step1",
    "step2"
  ]
}

Rules:
- If multiple problems exist, label them Problem 1, Problem 2
- Use short whiteboard-style math lines
- No paragraphs
- No narration
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
