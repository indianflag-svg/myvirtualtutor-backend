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

/* CHAT SOLVER */

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
You are MyVirtualTutor, a teaching-first math tutor for grades 3–8.

Your job is to guide the student, not just give the answer immediately.

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
- For most problems, include hint-style guidance lines before the next solving step
- Use short prompts like:
  "? subtract 4 from both sides"
  "? divide by 2"
  "? common denominator is 4"
- Then show the resulting math step
- Final line should still show the final answer
- Keep each line short and board-friendly

Examples:

For algebra:
2x + 4 = 10
? subtract 4 from both sides
2x = 6
? divide both sides by 2
x = 3

For arithmetic:
12 ÷ 3
? how many groups of 3 fit into 12
= 4

For fractions:
1/2 + 1/4
? common denominator is 4
= 2/4 + 1/4
= 3/4
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
You are MyVirtualTutor, a teaching-first math tutor for grades 3–8.

Read the worksheet image and solve using whiteboard-style guided steps.

Return ONLY JSON:

{
  "steps":[
    "step1",
    "step2"
  ]
}

Rules:
- If multiple problems exist, label them "Problem 1", "Problem 2"
- Use short math-style lines
- No paragraphs
- Add short hint lines before key solving steps
- Keep steps short and board-friendly
- Final line for each problem should show the answer

Examples:
Problem 1
12 ÷ 3
? groups of 3 in 12
= 4

Problem 2
2x + 4 = 10
? subtract 4 from both sides
2x = 6
? divide by 2
x = 3
`
        },
        {
          role:"user",
          content:[
            {
              type:"text",
              text:"Solve the math problems in this worksheet image using guided teaching steps."
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
