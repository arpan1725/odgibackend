const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { GoogleGenerativeAI } = require("@google/generative-ai");

dotenv.config();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

app.post("/api/chat", async (req, res) => {
  const { messages, systemPrompt } = req.body;

  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    ...messages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
  ];

  try {
    const result = await model.generateContent({
      contents,
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain",
      },
    });

    const response = result.response;
    const fullText = await response.text();

    res.json({ response: fullText });
  } catch (error) {
    console.error("API Error:", error.message);
    res.status(500).json({ error: "Failed to get response from Gemini API" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
