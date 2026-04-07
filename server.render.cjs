const express = require("express")
const cors = require("cors")

const app = express()
app.use(cors())
app.use(express.json())

// 🔒 Only allow math-like input
function isMath(input) {
  return /^[0-9xX+\-*/().\s/=]+$/.test(input)
}

// 🧠 Solve algebra: ax + b = c
function solveLinearEquation(eq) {
  try {
    const match = eq.match(/(\d*)x\s*\+\s*(\d+)\s*=\s*(\d+)/)
    if (!match) return null

    const a = parseInt(match[1] || "1")
    const b = parseInt(match[2])
    const c = parseInt(match[3])

    const step1 = `${a}x + ${b} = ${c}`
    const step2 = `${a}x = ${c - b}`
    const step3 = `x = ${(c - b) / a}`

    return `Step 1: Subtract ${b} from both sides  
${step2}

Step 2: Divide both sides by ${a}  
${step3}

Final answer: ${step3}`
  } catch {
    return null
  }
}

// 🧠 Solve fraction subtraction
function solveFractionSub(problem) {
  try {
    const [a, b] = problem.split("-").map(s => s.trim())

    const [n1, d1] = a.split("/").map(Number)
    const [n2, d2] = b.split("/").map(Number)

    const commonDen = d1 * d2
    const newN1 = n1 * d2
    const newN2 = n2 * d1

    const result = newN1 - newN2

    return `Step 1: Find common denominator (${commonDen})

Step 2: Convert fractions  
${n1}/${d1} = ${newN1}/${commonDen}  
${n2}/${d2} = ${newN2}/${commonDen}

Step 3: Subtract  
${newN1}/${commonDen} - ${newN2}/${commonDen} = ${result}/${commonDen}

Step 4: Simplify  
${result}/${commonDen} = ${(result/commonDen)}

Final answer: ${(result/commonDen)}`
  } catch {
    return null
  }
}

// 🧠 Solve multiplication
function solveMultiply(problem) {
  try {
    if (problem.includes("x") || problem.includes("X")) {
      const [a, b] = problem.split(/[xX]/).map(Number)
      const result = a * b

      return `Step 1: Multiply  
${a} × ${b} = ${result}

Final answer: ${result}`
    }
  } catch {
    return null
  }
}

// 🧠 Main handler
function solveMath(problem) {
  const algebra = solveLinearEquation(problem)
  if (algebra) return algebra

  if (problem.includes("/") && problem.includes("-")) {
    const frac = solveFractionSub(problem)
    if (frac) return frac
  }

  if (problem.includes("x") || problem.includes("X")) {
    const mult = solveMultiply(problem)
    if (mult) return mult
  }

  return "Try a basic math problem like 2x + 6 = 10 or 1/2 - 1/3."
}

app.post("/chat", (req, res) => {
  const { message } = req.body

  if (!isMath(message)) {
    return res.json({
      reply: "I’m a math tutor 😊 Please ask a math problem."
    })
  }

  const reply = solveMath(message)
  res.json({ reply })
})

app.listen(process.env.PORT || 10000, () => {
  console.log("Server running")
})
