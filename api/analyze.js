import fs from "node:fs";
import path from "node:path";

const MODEL_NAME = "gemini-3-flash-preview";
const SYSTEM_INSTRUCTION_PATH = path.join(process.cwd(), "lib", "KlaritexEngine.prompt.txt");

const SYSTEM_INSTRUCTION = fs.readFileSync(SYSTEM_INSTRUCTION_PATH, "utf8");

function extractJsonBlock(text) {
  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned);
}


function validateResultShape(result) {
  const analysis = result?.statement_analysis;
  const ambiguity = analysis?.ambiguity_score_data;
  const hasScore = typeof ambiguity?.ambiguity_score === "number";
  const hasTier = typeof ambiguity?.tier === "string";
  const hasLiteral = typeof analysis?.literal_translation === "string";
  const hasWorstLines = Array.isArray(analysis?.risk_profile?.worst_lines);

  return Boolean(hasScore && hasTier && hasLiteral && hasWorstLines);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildResultHtml(result) {
  const analysis = result?.statement_analysis || {};
  const ambiguity = analysis?.ambiguity_score_data || {};
  const score = typeof ambiguity.ambiguity_score === "number" ? ambiguity.ambiguity_score.toFixed(1) : "--";
  const tier = ambiguity.tier || "Unknown";
  const literal = analysis.literal_translation || "No literal translation returned.";
  const worstLines = Array.isArray(analysis?.risk_profile?.worst_lines) ? analysis.risk_profile.worst_lines : [];

  const worstLinesHtml = worstLines.length
    ? `<ul>${worstLines
        .map((line) => `<li><strong>${escapeHtml(line?.text || "(No text)")}:</strong> ${escapeHtml(line?.flaw || "No explanation")}</li>`)
        .join("")}</ul>`
    : "<p>No major vague lines were returned.</p>";

  return `
    <section>
      <h3>Ambiguity Score</h3>
      <p><strong>${score} / 10</strong></p>
      <p>Tier: <strong>${escapeHtml(tier)}</strong></p>
    </section>
    <section>
      <h3>Literal Reality</h3>
      <p>${escapeHtml(literal)}</p>
    </section>
    <section>
      <h3>Most Vague Lines</h3>
      ${worstLinesHtml}
    </section>
  `;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.Klaritex;

  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing env var: Klaritex" });
  }

  const userText = req.body?.text?.trim();

  if (!userText) {
    return res.status(400).json({ error: "Please provide text to analyze." });
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const body = {
      systemInstruction: {
        parts: [{ text: SYSTEM_INSTRUCTION }],
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
      const message = payload?.error?.message || "Gemini request failed.";
      return res.status(response.status).json({ error: message });
    }

    const modelText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!modelText) {
      return res.status(502).json({ error: "Gemini returned no text output." });
    }

    const result = extractJsonBlock(modelText);

    if (!validateResultShape(result)) {
      return res.status(502).json({
        error: "Gemini returned JSON in an unexpected shape. Expected statement_analysis.ambiguity_score_data.ambiguity_score (number), statement_analysis.ambiguity_score_data.tier (string), statement_analysis.literal_translation (string), and statement_analysis.risk_profile.worst_lines (array).",
      });
    }

    const html = buildResultHtml(result);

    return res.status(200).json({ html, result });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Unknown server error." });
  }
}
