const MAX_CHARS = 10000;

const inputText = document.getElementById("input-text");
const charCount = document.getElementById("char-count");
const analyzeBtn = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const resultHtmlEl = document.getElementById("result-html");
const scoreBadgeEl = document.getElementById("score-badge");
const visualSummaryEl = document.getElementById("visual-summary");
const copyResultBtn = document.getElementById("copy-result-btn");
const downloadResultBtn = document.getElementById("download-result-btn");
const exampleChips = document.querySelectorAll(".example-chip");
const themeToggleBtn = document.getElementById("theme-toggle");

const THEME_STORAGE_KEY = "klaritex-theme";
const DEFAULT_THEME = "dark";

const exampleTextByKey = {
  "contract-sentence":
    "If either party does not provide written notice of termination at least 30 days before the renewal date, this agreement will automatically renew for an additional 12-month term.",
  "policy-statement":
    "Employees may work remotely up to three days per week with manager approval, provided core collaboration hours from 10:00 AM to 3:00 PM local time are maintained.",
  "customer-support-message":
    "Thanks for contacting support. We received your request and will send an update within 24 hours; if your issue is urgent, please reply with your order number and the word PRIORITY.",
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
  analyzeBtn.textContent = isLoading ? "Analyzing..." : "Analyze Ambiguity";
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

function getScoreBand(scoreValue) {
  if (scoreValue <= 3.3) {
    return "low";
  }

  if (scoreValue <= 6.6) {
    return "medium";
  }

  return "high";
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

  const tier = typeof analysis?.ambiguity_score_data?.tier === "string" ? analysis.ambiguity_score_data.tier : "Unknown";
  const worstLines = Array.isArray(analysis?.risk_profile?.worst_lines) ? analysis.risk_profile.worst_lines : [];

  return {
    score: safeScore,
    tier,
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

function renderVisualSummary(payload) {
  const data = extractAnalysisData(payload);

  if (!data || !Number.isFinite(data.score)) {
    hideVisualSummary();
    return;
  }

  const scoreBand = getScoreBand(data.score);
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

      <article class="visual-summary__card visual-summary__card--tier">
        <h3>Risk Tier</h3>
        <p class="visual-summary__tier">${escapeHtml(data.tier)}</p>
        <p class="visual-summary__hint">Lower score = clearer language. Higher score = more room for interpretation.</p>
      </article>
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
    why: "•",
    suggestions: "→",
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

  const scoreBand = getScoreBand(scoreValue);
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

  try {
    setStatus("Analyzing with AI…", "loading");
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
    addHeadingMarkers(resultHtmlEl);
    renderScoreBadge(extractScore(payload));
    setResultActionsEnabled(Boolean(getResultPlainText()));
    setStatus("Analysis complete.", "success");
  } catch (error) {
    setStatus(`Error: ${error.message}`, "error");
    hideScoreBadge();
    hideVisualSummary();
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
