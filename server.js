import express from "express";
import cors from "cors";

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

function solveSimpleMath(input) {

  const clean = input.replace(/\s+/g, "");

  // simple addition
  const add = clean.match(/^(\d+)\+(\d+)$/);
  if (add) {
    const a = Number(add[1]);
    const b = Number(add[2]);
    return `${a} + ${b} = ${a + b}`;
  }

  // subtraction
  const sub = clean.match(/^(\d+)-(\d+)$/);
  if (sub) {
    const a = Number(sub[1]);
    const b = Number(sub[2]);
    return `${a} - ${b} = ${a - b}`;
  }

  // multiplication
  const mul = clean.match(/^(\d+)\*(\d+)$/);
  if (mul) {
    const a = Number(mul[1]);
    const b = Number(mul[2]);
    return `${a} × ${b} = ${a * b}`;
  }

  // division
  const div = clean.match(/^(\d+)\/(\d+)$/);
  if (div) {
    const a = Number(div[1]);
    const b = Number(div[2]);
    if (b === 0) return "Division by zero is not allowed.";
    return `${a} ÷ ${b} = ${a / b}`;
  }

  return null;
}

app.post("/chat", async (req, res) => {

  const { message } = req.body || {};

  if (!message) {
    return res.json({ ok: false, error: "No message provided" });
  }

  const simple = solveSimpleMath(message);

  if (simple) {
    return res.json({
      ok: true,
      reply: simple
    });
  }

  const reply =
`Step 1: Understand the problem

${message}

Step 2: Break it into smaller steps.

Step 3: Solve each part carefully.

Final answer:
Let's work through it together.`;

  res.json({
    ok: true,
    reply
  });

});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server listening on", PORT);
});
