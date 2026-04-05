import { SYSTEM_PROMPT } from "./systemPrompt.js";

const MAX_CHARS = 10000;
const MODEL_NAME = "gemini-3-flash-preview";

const apiKeyInput = document.getElementById("api-key");
const inputText = document.getElementById("input-text");
const charCount = document.getElementById("char-count");
const analyzeBtn = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const tierEl = document.getElementById("tier");

function updateCount() {
  charCount.textContent = `${inputText.value.length} / ${MAX_CHARS} characters`;
}

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.textContent = isLoading ? "Analyzing..." : "Analyze Ambiguity";
}

function extractJsonBlock(text) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

async function analyzeWithGemini({ apiKey, userText }) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const body = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      responseMimeType: "application/json",
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userText }],
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json();

  if (!response.ok) {
    const message = payload?.error?.message || "Request failed.";
    throw new Error(message);
  }

  const modelText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!modelText) {
    throw new Error("Gemini returned no text output.");
  }

  return extractJsonBlock(modelText);
}

analyzeBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();
  const userText = inputText.value.trim();

  if (!apiKey) {
    statusEl.textContent = "Please paste your Gemini API key.";
    return;
  }

  if (!userText) {
    statusEl.textContent = "Please enter text to analyze.";
    return;
  }

  setLoading(true);
  statusEl.textContent = "Sending text to Gemini...";
  scoreEl.textContent = "-- / 10";
  tierEl.textContent = "Tier: --";

  try {
    const result = await analyzeWithGemini({ apiKey, userText });
    const score = result?.statement_analysis?.ambiguity_score_data?.ambiguity_score;
    const tier = result?.statement_analysis?.ambiguity_score_data?.tier;

    if (typeof score !== "number") {
      throw new Error("Could not find ambiguity score in model response.");
    }

    statusEl.textContent = "Analysis complete.";
    scoreEl.textContent = `${score.toFixed(1)} / 10`;
    tierEl.textContent = `Tier: ${tier || "Unknown"}`;
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
  } finally {
    setLoading(false);
  }
});

inputText.addEventListener("input", updateCount);
updateCount();
