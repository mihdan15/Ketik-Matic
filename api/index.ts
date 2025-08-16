import "dotenv/config";
import express from "express";
import cors from "cors";

import { generateSeriousContent, generateInfiniteContent } from "../gemini.ts";
import { buildSeriousPrompt, buildInfinitePrompt } from "../prompts.ts";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);
app.use(express.json());

// 👋 Root route
app.get("/", (req, res) => {
  res.send("Hello World 🚀 — Ketik-Matic backend is running");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// SERIOUS mode
app.post("/serious", async (req, res) => {
  try {
    const { topic, lang, tone, targetWords } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const prompt = buildSeriousPrompt(topic, lang, tone, targetWords);
    const text = await generateSeriousContent(prompt);
    res.json({ text });
  } catch (error) {
    console.error("Error in /serious:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

// INFINITE mode (SSE)
app.post("/infinite", async (req, res) => {
  try {
    const { topic, lang, tone, continuation } = req.body;
    if (!topic) return res.status(400).json({ error: "Topic is required" });

    const prompt = buildInfinitePrompt(topic, lang, tone, continuation);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    try {
      for await (const chunk of generateInfiniteContent(prompt)) {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      }
      res.write("data: [DONE]\n\n");
    } catch (streamError) {
      console.error("Streaming error:", streamError);
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
    }

    res.end();
  } catch (error) {
    console.error("Error in /infinite:", error);
    res.status(500).json({ error: "Failed to start streaming" });
  }
});

// ⚠️ Penting: JANGAN ada app.listen di sini
export default app;
