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

Solve problems step-by-step using short math expressions like: 12 ÷ 3, = 4. Avoid sentences.

Return ONLY JSON in this format:

{
 "steps":[
  "step 1",
  "step 2",
  "step 3"
 ]
}
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
You are a math tutor. Look at the uploaded image of a math problem.

Identify the problem and solve it step-by-step.

Return ONLY JSON:

{
 "steps":[
  "step 1",
  "step 2",
  "step 3"
 ]
}
`
        },
        {
          role:"user",
          content:[
            {
              type:"text",
              text:"Solve the math problem in this image step-by-step."
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
