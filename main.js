const sampleStatementAnalysis = {
  original_text:
    "The administration has committed to a 14-to-21-day kinetic operation.",
  literal_translation:
    "A short military operation window is named, but success criteria and external verification requirements are still undefined.",
  ambiguity_score_data: {
    raw_penalty_score: 3.96,
    ambiguity_score: 3.3,
    tier: "LEVEL 2 (HAZY)",
  },
  assumptions_to_avoid: [
    {
      assumption: "A named timeline means the operation outcome is guaranteed.",
      flaw: "Timeline exists but does not define what completion means.",
      reality:
        "Only the activity window is specified; the success endpoint is still discretionary.",
    },
    {
      assumption: "Strong language automatically equals enforceable commitments.",
      flaw: "Rhetorical intensity can mask missing verification anchors.",
      reality:
        "Treat only verifiable actors, actions, and metrics as binding.",
    },
  ],
  elements: {
    who: {
      content: "US administration and military command",
      status: "CLEAR",
      reasoning: "Named decision makers are visible.",
    },
    action: {
      content: "Conduct kinetic operations",
      status: "BROAD",
      reasoning: "Action intent is present but scope details are wide.",
    },
    object: {
      content: "Iranian military targets",
      status: "BROAD",
      reasoning: "Target category is broad and not fully itemized.",
    },
    measure: {
      content: "No concrete success benchmark provided",
      status: "MISSING",
      reasoning: "No measurable completion test is stated.",
    },
    when: {
      content: "14 to 21 day window",
      status: "CLEAR",
      reasoning: "A bounded timeline is explicitly mentioned.",
    },
    premise: {
      content: "Reduce regional threat exposure",
      status: "BROAD",
      reasoning: "Rationale is directional but not tied to objective evidence.",
    },
  },
};

const labelMap = {
  who: "Who",
  action: "Action",
  object: "Object",
  measure: "Measure",
  when: "When",
  premise: "Premise",
};

function statusClass(status) {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "CLEAR") return "status-clear";
  if (normalized === "BROAD") return "status-broad";
  return "status-missing";
}

function renderAmbiguityDashboard(statementAnalysis, mountNode) {
  const data = statementAnalysis || {};
  const score = data.ambiguity_score_data || {};
  const elements = data.elements || {};
  const assumptions = Array.isArray(data.assumptions_to_avoid)
    ? data.assumptions_to_avoid
    : [];

  const elementCards = Object.entries(elements)
    .map(([key, value]) => {
      const state = statusClass(value?.status);
      return `
        <article class="anchor-item ${state}">
          <div class="top-row">
            <p class="anchor-label">${labelMap[key] || key}</p>
            <span class="status-badge">${value?.status || "MISSING"}</span>
          </div>
          <p class="anchor-content">${value?.content || "No data provided"}</p>
          <p class="anchor-reason">${value?.reasoning || "No reasoning provided"}</p>
        </article>`;
    })
    .join("");

  const trapRows = assumptions
    .map(
      (item) => `
        <article class="trap-item">
          <div class="trap-columns">
            <div class="trap-box trap">
              <h4>The Trap</h4>
              <p>${item.assumption || "No assumption provided"}</p>
            </div>
            <div class="trap-box reality">
              <h4>Literal Reality</h4>
              <p>${item.reality || "No literal reality provided"}</p>
            </div>
          </div>
          <p class="flaw-line">Why this is a trap: ${item.flaw || "No flaw provided"}</p>
        </article>
      `
    )
    .join("");

  mountNode.innerHTML = `
    <section class="dashboard">
      <article class="card verdict-card">
        <div>
          <h2>Visual 1 · The Verdict</h2>
          <p class="tier">${score.tier || "Tier unavailable"}</p>
        </div>
        <div class="score-pill">
          <strong>${Number(score.ambiguity_score ?? 0).toFixed(1)}/10</strong>
          <span>Ambiguity Score</span>
        </div>
      </article>

      <article class="card">
        <h3 class="section-title">Visual 2 · The Anchors</h3>
        <div class="anchor-grid">${elementCards}</div>
      </article>

      <article class="card">
        <h3 class="section-title">Visual 3 · Literal Reality</h3>
        <div class="high-signal">${
          data.literal_translation || "No literal translation provided."
        }</div>
      </article>

      <article class="card">
        <h3 class="section-title">Visual 4 · The Trap</h3>
        <div class="trap-grid">${
          trapRows || "<p>No assumptions_to_avoid items provided.</p>"
        }</div>
      </article>
    </section>
  `;
}

const root = document.getElementById("dashboard-root");
renderAmbiguityDashboard(sampleStatementAnalysis, root);

window.renderAmbiguityDashboard = renderAmbiguityDashboard;
