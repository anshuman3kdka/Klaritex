const MAX_CHARS = 10000;

const inputText = document.getElementById("input-text");
const charCount = document.getElementById("char-count");
const analyzeBtn = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const resultHtmlEl = document.getElementById("result-html");
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
  } catch (error) {
    statusEl.textContent = `Error: ${error.message}`;
  } finally {
    setLoading(false);
  }
});

inputText.addEventListener("input", updateCount);
updateCount();
