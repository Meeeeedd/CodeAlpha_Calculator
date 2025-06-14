// server.js - This runs on Node.js, not in the browser.

// 1. Import necessary libraries
const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config(); // Loads variables from .env file into process.env

// 2. Setup the Express server
const app = express();
const PORT = 3000; // The port your server will run on

// 3. Configure Middleware
app.use(express.json()); // Allows server to understand JSON data from the client
app.use(express.static("public")); // Serves all files from the 'public' folder (your HTML, CSS, client-side JS)

// 4. Define the secure API endpoint
app.post("/api/solve", async (req, res) => {
  try {
    const { problem, language } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    // Basic validation
    if (!apiKey) {
      console.error("API key is missing from .env file.");
      return res.status(500).json({ error: "Server configuration error." });
    }
    if (!problem) {
      return res.status(400).json({ error: "No problem text provided." });
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const prompt = `Analyze: "${problem}". The user's language is ${language}. Respond in JSON with "expression" and "answer" keys.`;

    const payload = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            expression: { type: "STRING" },
            answer: { type: "STRING" },
          },
          required: ["expression", "answer"],
        },
      },
    };

    // 5. Securely call the Google API from the backend
    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!geminiResponse.ok) {
      throw new Error(
        `Google API responded with status: ${geminiResponse.status}`
      );
    }

    const result = await geminiResponse.json();
    const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error("Received an invalid response from Google API.");
    }

    // 6. Send the result back to the client
    res.status(200).json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error handling /api/solve request:", error.message);
    res.status(500).json({ error: "Failed to solve the problem." });
  }
});

// 7. Start the server
app.listen(PORT, () => {
  console.log(`Calculator server running!`);
  console.log(`Access it at: http://localhost:${PORT}`);
});

// 8. Handle 404 errors
app.use((req, res) => {
  res.status(404).send("404 Not Found");
});

// 9. Handle errors globally
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).send("Internal Server Error");
});
