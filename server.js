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

app.post("/chat", async (req, res) => {
  const { message } = req.body || {};

  if (!message) {
    return res.json({ ok: false, error: "No message provided" });
  }

  const reply = `Let's solve it step by step.\n\nQuestion: ${message}`;

  res.json({
    ok: true,
    reply
  });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("Server listening on", PORT);
});
