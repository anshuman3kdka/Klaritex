import { classifyRiskTier } from "./lib/tierThresholds.js";

const MAX_CHARS = 10000;

const inputText = document.getElementById("input-text");
const charCount = document.getElementById("char-count");
const analyzeBtn = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const resultHtmlEl = document.getElementById("result-html");
const scoreBadgeEl = document.getElementById("score-badge");
const visualSummaryEl = document.getElementById("visual-summary");
const commitmentBreakdownEl = document.getElementById("commitment-breakdown");
const copyResultBtn = document.getElementById("copy-result-btn");
const downloadResultBtn = document.getElementById("download-result-btn");
const exampleChips = document.querySelectorAll(".example-chip");
const themeToggleBtn = document.getElementById("theme-toggle");

const THEME_STORAGE_KEY = "klaritex-theme";
const DEFAULT_THEME = "dark";

const exampleTextByKey = {
  "policy-pledge":
    "The Department of Housing will publish monthly shelter occupancy data by July 31, 2026, because Federal Statute 22 requires quarterly reporting.",
  "symbolic-claim":
    "We will fight for a better future for every family.",
  "mixed-commitment":
    "Our administration will review transport safety standards and share progress updates soon.",
};

function setTheme(themeName) {
  const resolvedTheme = themeName === "light" ? "light" : DEFAULT_THEME;
  document.documentElement.dataset.theme = resolvedTheme;

  if (!themeToggleBtn) {
    return;
  }

  const isLight = resolvedTheme === "light";
  themeToggleBtn.textContent = isLight ? "Dark theme" : "Light theme";
  themeToggleBtn.setAttribute("aria-label", isLight ? "Switch to dark theme" : "Switch to light theme");
  themeToggleBtn.setAttribute("aria-pressed", String(isLight));
}

function getSavedTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === "light" || savedTheme === "dark" ? savedTheme : DEFAULT_THEME;
}

function handleThemeToggle() {
  const currentTheme = document.documentElement.dataset.theme || DEFAULT_THEME;
  const nextTheme = currentTheme === "light" ? "dark" : "light";
  setTheme(nextTheme);
  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
}

function updateCount() {
  charCount.textContent = `${inputText.value.length} / ${MAX_CHARS} characters`;
}

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.textContent = isLoading ? "Analyzing..." : "Run Clarity Audit";
}

function setStatus(message, tone = "default") {
  statusEl.textContent = message;
  statusEl.classList.remove("status--loading", "status--success", "status--error");

  if (tone === "loading") {
    statusEl.classList.add("status--loading");
    return;
  }

  if (tone === "success") {
    statusEl.classList.add("status--success");
    return;
  }

  if (tone === "error") {
    statusEl.classList.add("status--error");
  }
}

function setResultActionsEnabled(isEnabled) {
  copyResultBtn.disabled = !isEnabled;
  downloadResultBtn.disabled = !isEnabled;
}

function parseScoreFromHtml(htmlText) {
  if (!htmlText) {
    return null;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, "text/html");

  const scoreHeading = Array.from(doc.querySelectorAll("h3")).find(
    (heading) => heading.textContent?.trim().toLowerCase() === "ambiguity score",
  );

  const scoreSection = scoreHeading?.closest("section");
  const sectionText = scoreSection?.textContent || doc.body.textContent || "";
  const scoreMatch = sectionText.match(/(10(?:\.0)?|[0-9](?:\.\d+)?)\s*\/\s*10/);

  if (!scoreMatch) {
    return null;
  }

  const numericScore = Number.parseFloat(scoreMatch[1]);
  return Number.isFinite(numericScore) ? numericScore : null;
}

function extractScore(payload) {
  const rawScore = payload?.result?.statement_analysis?.ambiguity_score_data?.ambiguity_score;

  if (typeof rawScore === "number" && Number.isFinite(rawScore)) {
    return rawScore;
  }

  return parseScoreFromHtml(payload?.html);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractAnalysisData(payload) {
  const analysis = payload?.result?.statement_analysis;

  if (!analysis || typeof analysis !== "object") {
    return null;
  }

  const scoreValue = Number(analysis?.ambiguity_score_data?.ambiguity_score);
  const safeScore = Number.isFinite(scoreValue) ? Math.max(0, Math.min(10, scoreValue)) : null;
  const tierData = classifyRiskTier(safeScore);
  const worstLines = Array.isArray(analysis?.risk_profile?.worst_lines) ? analysis.risk_profile.worst_lines : [];

  return {
    score: safeScore,
    tierData,
    worstLines,
  };
}

function hideScoreBadge() {
  scoreBadgeEl.hidden = true;
  scoreBadgeEl.textContent = "";
  scoreBadgeEl.classList.remove("score-badge--low", "score-badge--medium", "score-badge--high");
}

function hideVisualSummary() {
  visualSummaryEl.hidden = true;
  visualSummaryEl.innerHTML = "";
}

function hideCommitmentBreakdown() {
  commitmentBreakdownEl.hidden = true;
  commitmentBreakdownEl.innerHTML = "";
}

function normalizeWhitespace(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function buildSnippet(text, fallback = "Not found in statement.") {
  const normalized = normalizeWhitespace(text);
  return normalized || fallback;
}

function getStatusTone(status) {
  if (status === "clear") {
    return "locked";
  }

  if (status === "broad") {
    return "unclear";
  }

  return "missing";
}

function getStatusLabel(status) {
  if (status === "clear") {
    return "LOCKED IN";
  }

  if (status === "broad") {
    return "UNCLEAR";
  }

  return "MISSING";
}

function scoreStatus(status, weights) {
  if (status === "clear") {
    return 0;
  }

  if (status === "broad") {
    return weights * 0.5;
  }

  return weights;
}

function evaluateWho(statement) {
  const trimmed = normalizeWhitespace(statement);
  const whoMatch = trimmed.match(/^([^,.;!?]+?)\s+(?:will|shall|must|can|could|should|plans?\s+to|plan\s+to|aims?\s+to|aim\s+to)\b/i);
  const snippet = buildSnippet(whoMatch?.[1]);

  if (!whoMatch) {
    return {
      id: "who",
      title: "Who is doing it?",
      helper: "The specific person or group doing the work.",
      snippet,
      status: "missing",
    };
  }

  const normalizedWho = whoMatch[1].trim().toLowerCase();
  const broadWhoPattern = /^(we|they|people|everyone|administration|leadership|team|committee|government|officials?)$/i;

  return {
    id: "who",
    title: "Who is doing it?",
    helper: "The specific person or group doing the work.",
    snippet,
    status: broadWhoPattern.test(normalizedWho) ? "broad" : "clear",
  };
}

function evaluateAction(statement) {
  const actionMatch = normalizeWhitespace(statement).match(
    /\b(?:will|shall|must|can|could|should|plans?\s+to|plan\s+to|aims?\s+to|aim\s+to)\s+([a-z][a-z\s-]{1,60})/i,
  );
  const actionSnippet = buildSnippet(actionMatch?.[1]?.split(/\b(?:for|to|on|in|by|with|because)\b/i)[0]);
  const symbolicAction = /\b(fight|support|encourage|prioritize|strive|work toward|promote|believe|seek)\b/i;
  const clearAction = /\b(install|ban|sign|publish|launch|build|deliver|hire|reduce|increase|implement|audit|close|open)\b/i;

  let status = "missing";

  if (actionMatch) {
    if (clearAction.test(actionSnippet)) {
      status = "clear";
    } else if (symbolicAction.test(actionSnippet)) {
      status = "missing";
    } else {
      status = "broad";
    }
  }

  return {
    id: "action",
    title: "What happens?",
    helper: "The real-world event that actually happens.",
    snippet: actionSnippet,
    status,
  };
}

function evaluateObject(statement) {
  const objectMatch = normalizeWhitespace(statement).match(/\b(?:for|on|in|across|within|toward|against)\s+([^,.!?;]+?)(?:\s+\bby\b|\s+\bbecause\b|$)/i);
  const snippet = buildSnippet(objectMatch?.[1]);

  return {
    id: "object",
    title: "Who is affected?",
    helper: "The person or thing receiving the action.",
    snippet,
    status: objectMatch ? "clear" : "missing",
  };
}

function evaluateMeasure(statement) {
  const normalized = normalizeWhitespace(statement);
  const measureClearPattern = /\b(\d+(\.\d+)?\s*%|\d+(\.\d+)?\s*(days?|weeks?|months?|years?)|\bby\s+\d+|\bat\s+least\s+\d+)\b/i;
  const measureBroadPattern = /\b(meaningful(ly)?|significant(ly)?|better|improve|stronger|more|less)\b/i;

  let status = "missing";
  let snippet = "No measurement phrase found.";

  const byClause = normalized.match(/\b(?:by|at least|up to|no more than)\s+([^,.!?;]+)/i);
  if (byClause) {
    snippet = buildSnippet(byClause[0]);
  }

  if (measureClearPattern.test(normalized)) {
    status = "clear";
  } else if (measureBroadPattern.test(normalized)) {
    status = "broad";
    const broadHit = normalized.match(measureBroadPattern);
    snippet = buildSnippet(broadHit?.[0], snippet);
  }

  return {
    id: "measure",
    title: "How do we know?",
    helper: "The proof we use to know if it happened.",
    snippet,
    status,
  };
}

function evaluateTimeline(statement) {
  const normalized = normalizeWhitespace(statement);
  const clearPattern =
    /\b(by|before|on|starting|from)\s+((jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}(,\s*\d{4})?|\d{4}|q[1-4]|[a-z]+\s+\d{4}|\d+\s+(days?|weeks?|months?|years?))/i;
  const broadPattern = /\b(soon|coming months?|near future|as soon as possible|eventually|in time)\b/i;

  const clearHit = normalized.match(clearPattern);
  if (clearHit) {
    return {
      id: "timeline",
      title: "When?",
      helper: "The specific time or deadline.",
      snippet: buildSnippet(clearHit[0]),
      status: "clear",
    };
  }

  const broadHit = normalized.match(broadPattern);
  if (broadHit) {
    return {
      id: "timeline",
      title: "When?",
      helper: "The specific time or deadline.",
      snippet: buildSnippet(broadHit[0]),
      status: "broad",
    };
  }

  return {
    id: "timeline",
    title: "When?",
    helper: "The specific time or deadline.",
    snippet: "No timeline found.",
    status: "missing",
  };
}

function evaluatePremise(statement) {
  const normalized = normalizeWhitespace(statement);
  const premiseMatch = normalized.match(/\b(because|due to|to comply with|as required by|following|based on)\s+([^,.!?;]+)/i);

  if (!premiseMatch) {
    return {
      id: "premise",
      title: "Why?",
      helper: "The facts or rules this is based on.",
      snippet: "No reason provided.",
      status: "missing",
    };
  }

  const snippet = buildSnippet(premiseMatch[0]);
  const clearPattern = /\b(law|act|code|data|report|audit|court|regulation|statute|\d+%|\d{4})\b/i;
  const symbolicPattern = /\b(believe|hope|future|right thing|values?|vision)\b/i;

  let status = "broad";
  if (clearPattern.test(premiseMatch[0])) {
    status = "clear";
  } else if (symbolicPattern.test(premiseMatch[0])) {
    status = "missing";
  }

  return {
    id: "premise",
    title: "Why?",
    helper: "The facts or rules this is based on.",
    snippet,
    status,
  };
}

function calibratePartsToModelScore(parts, modelScore) {
  if (!Number.isFinite(modelScore)) {
    return parts;
  }

  const calibrated = parts.map((part) => ({ ...part }));
  const byPriority = ["premise", "measure", "timeline", "who", "action", "object"];

  const countByStatus = (status) => calibrated.filter((part) => part.status === status).length;
  const firstByPriority = (allowedStatuses) =>
    byPriority
      .map((id) => calibrated.findIndex((part) => part.id === id && allowedStatuses.includes(part.status)))
      .find((index) => index >= 0);

  if (modelScore <= 1.2) {
    calibrated.forEach((part) => {
      if (part.status !== "clear") {
        part.status = "clear";
      }
    });
    return calibrated;
  }

  if (modelScore <= 2.5) {
    while (countByStatus("missing") > 1) {
      const index = firstByPriority(["missing"]);
      if (index < 0) {
        break;
      }
      calibrated[index].status = "broad";
    }

    while (countByStatus("broad") > 2) {
      const index = firstByPriority(["broad"]);
      if (index < 0) {
        break;
      }
      calibrated[index].status = "clear";
    }
  }

  if (modelScore >= 6.1) {
    while (countByStatus("missing") + countByStatus("broad") < 3) {
      const index = firstByPriority(["clear"]);
      if (index < 0) {
        break;
      }
      calibrated[index].status = calibrated[index].id === "premise" || calibrated[index].id === "measure" ? "missing" : "broad";
    }
  }

  return calibrated;
}

function analyzeCommitmentBreakdown(statement, modelScore) {
  const parts = [
    evaluateWho(statement),
    evaluateAction(statement),
    evaluateObject(statement),
    evaluateMeasure(statement),
    evaluateTimeline(statement),
    evaluatePremise(statement),
  ];
  const calibratedParts = calibratePartsToModelScore(parts, modelScore);

  const weightsById = {
    who: 3,
    action: 2,
    object: 1,
    measure: 2,
    timeline: 1.5,
    premise: 2.5,
  };

  const rawPenalty = calibratedParts.reduce((sum, part) => sum + scoreStatus(part.status, weightsById[part.id] || 1), 0);
  const score = Math.min(10, Math.max(0, (rawPenalty / 12) * 10));
  return { parts: calibratedParts, score };
}

function renderCommitmentBreakdown(statement, modelScore) {
  if (!commitmentBreakdownEl) {
    return;
  }

  const analysis = analyzeCommitmentBreakdown(statement, modelScore);
  const displayScore = Number.isFinite(modelScore) ? modelScore : analysis.score;
  const rowsHtml = analysis.parts
    .map((part) => {
      const tone = getStatusTone(part.status);
      const label = getStatusLabel(part.status);
      return `
        <article class="commitment-row commitment-row--${tone}">
          <div class="commitment-row__head">
            <h3>${escapeHtml(part.title)}</h3>
            <span class="commitment-pill commitment-pill--${tone}">${escapeHtml(label)}</span>
          </div>
          <p class="commitment-row__helper">${escapeHtml(part.helper)}</p>
          <p class="commitment-row__value">${escapeHtml(part.snippet)}</p>
        </article>
      `;
    })
    .join("");

  commitmentBreakdownEl.innerHTML = `
    <header class="commitment-breakdown__header">
      <h2>6-Part Commitment Breakdown</h2>
      <p class="commitment-breakdown__subtitle">Where this statement is structurally clear vs ambiguous</p>
      <p class="commitment-breakdown__score">Skeleton score: <strong>${displayScore.toFixed(1)} / 10</strong></p>
    </header>
    <div class="commitment-breakdown__rows">${rowsHtml}</div>
  `;
  commitmentBreakdownEl.hidden = false;
}

function renderStatusCard(tierData) {
  if (!tierData) {
    return `
      <article class="status-card status-card--unknown">
        <h3>Ambiguity Tier</h3>
        <p class="status-card__name">Unknown</p>
        <p class="status-card__description">We could not classify risk for this score.</p>
      </article>
    `;
  }

  return `
    <article class="status-card status-card--${tierData.tone}">
      <h3>Ambiguity Tier</h3>
      <p class="status-card__name">${escapeHtml(tierData.icon)} ${escapeHtml(tierData.name)}</p>
      <p class="status-card__description">${escapeHtml(tierData.description)}</p>
    </article>
  `;
}

function renderVisualSummary(payload) {
  const data = extractAnalysisData(payload);

  if (!data || !Number.isFinite(data.score)) {
    hideVisualSummary();
    return;
  }

  const scoreBand = data.tierData?.tone || "medium";
  const percentage = Math.round((data.score / 10) * 100);
  const worstLines = data.worstLines.slice(0, 3);
  const highestRank = Math.max(1, worstLines.length);

  const barsHtml = worstLines.length
    ? worstLines
        .map((line, index) => {
          const rankValue = highestRank - index;
          const rankPercent = Math.max(20, Math.round((rankValue / highestRank) * 100));
          const safeText = escapeHtml(String(line?.text || "(No line text)"));
          return `
            <li class="visual-summary__bar-item">
              <p class="visual-summary__bar-label">${safeText}</p>
              <div class="visual-summary__bar-track" role="img" aria-label="Ranked risk bar at ${rankPercent}% intensity">
                <div class="visual-summary__bar-fill" style="width:${rankPercent}%"></div>
              </div>
            </li>
          `;
        })
        .join("")
    : '<p class="visual-summary__empty">No high-risk lines found in this response.</p>';

  visualSummaryEl.innerHTML = `
    <section class="visual-summary__top-row">
      <article class="visual-summary__card visual-summary__card--meter visual-summary__card--${scoreBand}">
        <h3>Ambiguity Meter</h3>
        <div class="visual-summary__meter" style="--meter-fill:${percentage}%" role="img" aria-label="Ambiguity score ${data.score.toFixed(1)} out of 10">
          <span>${data.score.toFixed(1)}</span>
        </div>
        <p>${percentage}% ambiguous</p>
      </article>

      ${renderStatusCard(data.tierData)}
    </section>

    <section class="visual-summary__card visual-summary__card--bars">
      <h3>Top Risk Lines (Chart)</h3>
      <ul class="visual-summary__bars">${barsHtml}</ul>
    </section>
  `;

  visualSummaryEl.hidden = false;
}

function addHeadingMarkers(rootEl) {
  if (!rootEl) {
    return;
  }

  const headingMarkerByTitle = {
    "ambiguity score": "◆",
    "diagnostic summary": "•",
    "most vague lines": "•",
  };

  const headings = rootEl.querySelectorAll("h3");

  headings.forEach((heading) => {
    if (heading.querySelector(".heading-marker")) {
      return;
    }

    const normalizedHeading = heading.textContent?.trim().toLowerCase();
    const markerText = headingMarkerByTitle[normalizedHeading];

    if (!markerText) {
      return;
    }

    const markerEl = document.createElement("span");
    markerEl.className = "heading-marker";
    markerEl.textContent = markerText;
    markerEl.setAttribute("aria-hidden", "true");
    heading.prepend(markerEl);
  });
}

function renderScoreBadge(scoreValue) {
  if (!Number.isFinite(scoreValue)) {
    hideScoreBadge();
    return;
  }

  const scoreBand = classifyRiskTier(scoreValue)?.tone || "medium";
  scoreBadgeEl.hidden = false;
  scoreBadgeEl.textContent = scoreValue.toFixed(1);
  scoreBadgeEl.classList.remove("score-badge--low", "score-badge--medium", "score-badge--high");
  scoreBadgeEl.classList.add(`score-badge--${scoreBand}`);
}

function getResultPlainText() {
  return resultHtmlEl.textContent?.trim() || "";
}

async function copyResultText() {
  const textContent = getResultPlainText();

  if (!textContent) {
    setStatus("No result text available to copy yet.");
    return;
  }

  try {
    await navigator.clipboard.writeText(textContent);
    setStatus("Result copied to clipboard.", "success");
  } catch {
    setStatus("Copy failed. Your browser may block clipboard access.", "error");
  }
}

function downloadResultText() {
  const textContent = getResultPlainText();

  if (!textContent) {
    setStatus("No result text available to download yet.");
    return;
  }

  const textBlob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(textBlob);
  const downloadLink = document.createElement("a");
  downloadLink.href = downloadUrl;
  downloadLink.download = "klaritex-result.txt";
  document.body.append(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(downloadUrl);
  setStatus("Downloaded result as .txt.", "success");
}

exampleChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const exampleKey = chip.dataset.exampleKey;
    const sampleText = exampleTextByKey[exampleKey];

    if (!sampleText) {
      return;
    }

    inputText.value = sampleText;
    inputText.focus();
    updateCount();
  });
});

copyResultBtn.addEventListener("click", copyResultText);
downloadResultBtn.addEventListener("click", downloadResultText);
themeToggleBtn?.addEventListener("click", handleThemeToggle);

analyzeBtn.addEventListener("click", async () => {
  const userText = inputText.value.trim();

  if (!userText) {
    setStatus("Please enter text to analyze.", "error");
    return;
  }

  setLoading(true);
  setResultActionsEnabled(false);
  setStatus("Validating input…", "loading");
  resultHtmlEl.innerHTML = "";
  hideScoreBadge();
  hideVisualSummary();
  hideCommitmentBreakdown();

  try {
    setStatus("Analyzing…", "loading");
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: userText }),
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.error || "Request failed.");
    }

    setStatus("Formatting your report…", "loading");
    resultHtmlEl.innerHTML = payload.html || "<p>No HTML returned from the server.</p>";
    renderVisualSummary(payload);
    renderCommitmentBreakdown(userText, extractScore(payload));
    addHeadingMarkers(resultHtmlEl);
    renderScoreBadge(extractScore(payload));
    setResultActionsEnabled(Boolean(getResultPlainText()));
    setStatus("Analysis complete.", "success");
  } catch (error) {
    setStatus(`Error: ${error.message}`, "error");
    hideScoreBadge();
    hideVisualSummary();
    hideCommitmentBreakdown();
    setResultActionsEnabled(false);
  } finally {
    setLoading(false);
  }
});

inputText.addEventListener("input", updateCount);
setTheme(getSavedTheme());
updateCount();
setResultActionsEnabled(false);
hideVisualSummary();
hideCommitmentBreakdown();
