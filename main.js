const MAX_CHARS = 10000;

const inputText = document.getElementById("input-text");
const charCount = document.getElementById("char-count");
const analyzeBtn = document.getElementById("analyze-btn");
const statusEl = document.getElementById("status");
const resultHtmlEl = document.getElementById("result-html");

function updateCount() {
  charCount.textContent = `${inputText.value.length} / ${MAX_CHARS} characters`;
}

function setLoading(isLoading) {
  analyzeBtn.disabled = isLoading;
  analyzeBtn.textContent = isLoading ? "Analyzing..." : "Analyze Ambiguity";
}

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
