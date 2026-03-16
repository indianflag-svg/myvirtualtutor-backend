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

app.get("/", (req,res)=>{
  res.send("MyVirtualTutor backend running")
})

/* CHAT STEP SOLVER */

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
      model:"gpt-4o-mini",
      messages:[
        {
          role:"system",
          content:`
You are MyVirtualTutor, a math tutor for grades 3–8.

Solve problems step-by-step using short math expressions.

Return ONLY JSON in this format:

{
  "steps":[
    "12 ÷ 3",
    "= 4"
  ]
}

Rules:
- Use math-style steps only
- No sentences
- No explanations
- No words like "Step 1"
- Final line should be the final math result
`
        },
        {
          role:"user",
          content:message
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
      steps:["Tutor had trouble solving that."]
    })

  }

})

/* PHOTO SOLVER */

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

Find all math problems in the image. If there are multiple, label them "Problem 1", "Problem 2", etc. Solve each separately using whiteboard-style math steps.

Return ONLY JSON in this format:

{
  "steps":[
    "12 ÷ 3",
    "= 4"
  ]
}

Rules:
- Output only short math-style lines
- No sentences
- No explanations
- No narration
- No labels like "Step 1"
- Prefer expressions like:
  "4 × 16 × 3"
  "= 64 × 3"
  "= 192"
- If there are multiple problems, solve them in order and separate them with a short title line like:
  "Problem 1"
  "Problem 2"
- Keep every line short and whiteboard-friendly
`
        },
        {
          role:"user",
          content:[
            {
              type:"text",
              text:"Read the worksheet image and return clean whiteboard-style math steps only."
            },
            {
              type:"image_url",
              image_url:{
                url:`data:image/png;base64,${base64}`
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
