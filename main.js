const MAX_CHARS = 10000;

const inputText = document.getElementById("input-text");
const charCount = document.getElementById("char-count");
const analyzeBtn = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const resultHtmlEl = document.getElementById("result-html");
const scoreBadgeEl = document.getElementById("score-badge");
const exampleChips = document.querySelectorAll(".example-chip");

const exampleTextByKey = {
  "contract-sentence":
    "If either party does not provide written notice of termination at least 30 days before the renewal date, this agreement will automatically renew for an additional 12-month term.",
  "policy-statement":
    "Employees may work remotely up to three days per week with manager approval, provided core collaboration hours from 10:00 AM to 3:00 PM local time are maintained.",
  "customer-support-message":
    "Thanks for contacting support. We received your request and will send an update within 24 hours; if your issue is urgent, please reply with your order number and the word PRIORITY.",
};

function updateCount() {
  charCount.textContent = `${inputText.value.length} / ${MAX_CHARS} characters`;
}

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.textContent = isLoading ? "Analyzing..." : "Analyze Ambiguity";
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

function hideScoreBadge() {
  scoreBadgeEl.hidden = true;
  scoreBadgeEl.textContent = "";
  scoreBadgeEl.classList.remove("score-badge--low", "score-badge--medium", "score-badge--high");
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

analyzeBtn.addEventListener("click", async () => {
  const userText = inputText.value.trim();

  if (!userText) {
    statusEl.textContent = "Please enter text to analyze.";
    return;
  }

  setLoading(true);
  statusEl.textContent = "Sending text to server...";
  resultHtmlEl.innerHTML = "";
  hideScoreBadge();

  try {
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

    statusEl.textContent = "Analysis complete.";
    resultHtmlEl.innerHTML = payload.html || "<p>No HTML returned from the server.</p>";
    renderScoreBadge(extractScore(payload));
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
    hideScoreBadge();
  } finally {
    setLoading(false);
  }
});

inputText.addEventListener("input", updateCount);
updateCount();
