import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateSeriousContent, generateInfiniteContent } from "./gemini.ts";

import { buildSeriousPrompt, buildInfinitePrompt } from "./prompts.ts";

dotenv.config();
console.log("GEMINI API Key Loaded:", process.env.GEMINI_API_KEY);
const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// SERIOUS mode - generate complete essay
app.post("/api/serious", async (req, res) => {
  try {
    const { topic, lang, tone, targetWords } = req.body;
    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }
    const prompt = buildSeriousPrompt(topic, lang, tone, targetWords);
    const text = await generateSeriousContent(prompt);
    res.json({ text });
  } catch (error) {
    console.error("Error in /api/serious:", error);
    res.status(500).json({ error: "Failed to generate content" });
  }
});

// INFINITE mode - streaming content
app.post("/api/infinite", async (req, res) => {
  try {
    const { topic, lang, tone, continuation } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Topic is required" });
    }

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
    console.error("Error in /api/infinite:", error);
    res.status(500).json({ error: "Failed to start streaming" });
  }
});

// TES
// async function testApiKeyWithFetch(apiKey: string): Promise<any> {
//   // URL endpoint TANPA API key
//   const url =
//     // "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent";
//     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

//   const requestBody = {
//     contents: [
//       {
//         parts: [
//           {
//             text: "Katakan Halo",
//           },
//         ],
//       },
//     ],
//   };

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         // API key sekarang ditempatkan di sini
//         "X-goog-api-key": apiKey,
//       },
//       body: JSON.stringify(requestBody),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error.message || "Unknown API Error");
//     }

//     return { success: true, data };
//   } catch (error: any) {
//     console.error("Kesalahan saat memanggil API dengan fetch:", error.message);
//     return { success: false, error: error.message };
//   }
// }

// // Ganti endpoint /api/test Anda dengan ini:
// app.get("/api/test", async (req, res) => {
//   const apiKey = process.env.GEMINI_API_KEY;

//   if (!apiKey) {
//     return res.status(500).json({
//       success: false,
//       error: "GEMINI_API_KEY tidak ditemukan di .env",
//     });
//   }

//   console.log("--- Menjalankan tes dengan fungsi fetch mandiri ---");
//   const result = await testApiKeyWithFetch(apiKey);

//   if (result.success) {
//     console.log("Tes fetch mandiri BERHASIL!");
//     res.status(200).json(result);
//   } else {
//     console.log("Tes fetch mandiri GAGAL!");
//     res.status(400).json(result);
//   }
// });

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 KetikMatic backend ready`);
});
