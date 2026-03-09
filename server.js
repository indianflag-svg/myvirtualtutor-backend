import express from "express";
import cors from "cors";
import algebra from "algebra.js";

const app = express();

app.use(express.json());

app.use(cors({
  origin: [
    "https://myvirtualtutor.com",
    "https://www.myvirtualtutor.com",
    "https://myvirtualtutor-frontend.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("MyVirtualTutor backend running");
});

function solveMath(input) {

  try {

    // simple arithmetic
    if (/^[0-9+\-*/().\s]+$/.test(input)) {
      const result = eval(input);
      return `${input} = ${result}`;
    }

    // simple linear equation like 2x+3=7
    if (input.includes("=") && input.includes("x")) {

      const parts = input.split("=");

      const left = algebra.parse(parts[0]);
      const right = algebra.parse(parts[1]);

      const equation = new algebra.Equation(left, right);
      const answer = equation.solveFor("x");

      return `Solution:\n\n${input}\n\nx = ${answer}`;

    }

  } catch (e) {}

  return null;
}

app.post("/chat", async (req, res) => {

  const { message } = req.body || {};

  if (!message) {
    return res.json({ ok: false, error: "No message provided" });
  }

  const mathResult = solveMath(message);

  if (mathResult) {
    return res.json({
      ok: true,
      reply: mathResult
    });
  }

  return res.json({
    ok: true,
    reply: `Let's think through this step by step.\n\nQuestion: ${message}`
  });

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server listening on", PORT);
});
