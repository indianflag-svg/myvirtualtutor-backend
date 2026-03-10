const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("MyVirtualTutor backend running");
});

app.post("/chat", async (req, res) => {
  const message = req.body.message || "";

  // Simple math example
  if (message.trim() === "2+2") {
    return res.json({
      ok: true,
      reply: "2+2 = 4"
    });
  }

  res.json({
    ok: true,
    reply: `You asked: ${message}`
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
