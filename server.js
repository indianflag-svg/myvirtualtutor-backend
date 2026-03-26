const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend working");
});

app.post("/chat", (req, res) => {
  const { message } = req.body;

  let result;
  try {
    result = eval(message);
  } catch {
    result = "error";
  }

  res.json({ ok: true, reply: String(result) });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Server listening on port " + PORT);
});
