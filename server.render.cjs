const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

// 🧠 SIMPLE STEP-BY-STEP SOLVER
function solveMath(problem) {
  try {
    // FRACTIONS ADDITION (basic handling)
    if (problem.includes("/") && problem.includes("+")) {
      const [a, b] = problem.split("+").map(s => s.trim())

      const [n1, d1] = a.split("/").map(Number)
      const [n2, d2] = b.split("/").map(Number)

      const commonDen = d1 * d2
      const newN1 = n1 * d2
      const newN2 = n2 * d1

      const resultNum = newN1 + newN2

      return `Step 1: Find common denominator (${commonDen})

Step 2: Convert fractions
${n1}/${d1} = ${newN1}/${commonDen}
${n2}/${d2} = ${newN2}/${commonDen}

Step 3: Add
${newN1}/${commonDen} + ${newN2}/${commonDen} = ${resultNum}/${commonDen}

Step 4: Final answer
= ${(resultNum / commonDen).toFixed(2)}`
    }

    // DEFAULT (fallback)
    const result = eval(problem)
    return `Step 1: Solve the expression

${problem} = ${result}`
    
  } catch {
    return "Sorry, I couldn’t solve that. Try another problem."
  }
}

app.post("/chat", (req, res) => {
  const { message } = req.body

  const reply = solveMath(message)

  res.json({ reply })
})

app.get("/", (req, res) => {
  res.send("Backend running")
})

app.listen(10000, () => {
  console.log("Server listening on 10000")
})
