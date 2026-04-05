const statusClasses = {
  CLEAR: "status-clear",
  BROAD: "status-broad",
  MISSING: "status-missing",
};

const statusLabels = {
  CLEAR: "CLEAR",
  BROAD: "BROAD",
  MISSING: "MISSING",
};

const elementMeta = [
  { key: "who", label: "Who", hint: "Who is responsible" },
  { key: "action", label: "Action", hint: "What action happens" },
  { key: "object", label: "Object", hint: "Who/what is affected" },
  { key: "measure", label: "Measure", hint: "How success is checked" },
  { key: "when", label: "When", hint: "Timeline / deadline" },
  { key: "premise", label: "Why", hint: "Premise / justification" },
];

export function renderAmbiguityDashboard(statementAnalysis, mountElement) {
  const root = mountElement;

  if (!statementAnalysis || typeof statementAnalysis !== "object") {
    root.innerHTML = `<div class="card"><p>Missing statement_analysis JSON.</p></div>`;
    return;
  }

  const scoreData = statementAnalysis.ambiguity_score_data ?? {};
  const score = Number(scoreData.ambiguity_score ?? 0).toFixed(1);
  const tier = scoreData.tier ?? "Unknown Tier";

  const anchorsHtml = elementMeta
    .map(({ key, label, hint }) => {
      const item = statementAnalysis.elements?.[key] ?? {};
      const status = item.status ?? "MISSING";
      const className = statusClasses[status] ?? statusClasses.MISSING;
      const content = item.content || "No anchor provided";
      const reasoning = item.reasoning || "No detail provided.";

      return `
        <article class="anchor-card ${className}">
          <div class="anchor-top-row">
            <div>
              <h3>${label}</h3>
              <p class="hint">${hint}</p>
            </div>
            <span class="pill">${statusLabels[status] ?? "MISSING"}</span>
          </div>
          <p class="anchor-content">${content}</p>
          <p class="anchor-reasoning">${reasoning}</p>
        </article>
      `;
    })
    .join("");

  const assumptions = statementAnalysis.assumptions_to_avoid ?? [];
  const assumptionsHtml = assumptions.length
    ? assumptions
        .map(
          (item, index) => `
      <article class="trap-row">
        <p class="trap-count">Trap ${index + 1}</p>
        <div class="split-grid">
          <div>
            <h4>The Trap</h4>
            <p>${item.assumption ?? "No assumption provided."}</p>
            <p class="subline">Why this is risky: ${item.flaw ?? "No flaw provided."}</p>
          </div>
          <div>
            <h4>Literal Reality</h4>
            <p>${item.reality ?? "No reality provided."}</p>
          </div>
        </div>
      </article>
    `,
        )
        .join("")
    : `<article class="trap-row"><p>No assumptions_to_avoid data provided.</p></article>`;

  root.innerHTML = `
    <section class="card verdict-card">
      <div>
        <p class="eyebrow">Visual 1 · The Verdict</p>
        <h2>${tier}</h2>
      </div>
      <div class="score-block">
        <p class="score-value">${score}<span>/10</span></p>
        <p class="score-label">Ambiguity Score</p>
      </div>
    </section>

    <section class="card">
      <p class="eyebrow">Visual 2 · The Anchors</p>
      <h2>Commitment Breakdown</h2>
      <div class="anchors-grid">${anchorsHtml}</div>
    </section>

    <section class="card high-signal-box">
      <p class="eyebrow">Visual 3 · Literal Reality</p>
      <h2>High Signal</h2>
      <p>${statementAnalysis.literal_translation ?? "No literal translation provided."}</p>
    </section>

    <section class="card">
      <p class="eyebrow">Visual 4 · The Trap</p>
      <h2>Assumptions to Avoid</h2>
      <div class="trap-list">${assumptionsHtml}</div>
    </section>
  `;
}

const demoPayload = {
  statement_analysis: {
    original_text: "The administration will act soon to resolve the issue.",
    literal_translation:
      "A future action is suggested, but no concrete mechanism, standard, or trigger is contractually fixed.",
    ambiguity_score_data: {
      raw_penalty_score: 4,
      ambiguity_score: 3.3,
      tier: "Level 2 (Hazy)",
    },
    assumptions_to_avoid: [
      {
        assumption: "Action will definitely happen on a fixed timeline.",
        flaw: "The timeline is broad and depends on internal discretion.",
        reality: "Only intent is described; no exact date or trigger is locked.",
      },
      {
        assumption: "Success is objectively measurable.",
        flaw: "No measurable threshold is defined.",
        reality: "Interpretation of success remains open-ended.",
      },
    ],
    elements: {
      who: {
        content: "US Military / Administration",
        status: "CLEAR",
        reasoning: "A specific actor is named.",
      },
      action: {
        content: "Act soon",
        status: "BROAD",
        reasoning: "Action is generic and not tied to verifiable event wording.",
      },
      object: {
        content: "The issue",
        status: "BROAD",
        reasoning: "Target is broad and can be interpreted multiple ways.",
      },
      measure: {
        content: "No explicit metric",
        status: "MISSING",
        reasoning: "No measurement method provided.",
      },
      when: {
        content: "Soon",
        status: "BROAD",
        reasoning: "No fixed date or bounded window.",
      },
      premise: {
        content: "Need to resolve issue",
        status: "BROAD",
        reasoning: "Justification is asserted without concrete anchor.",
      },
    },
  },
};

const root = document.getElementById("dashboard-root");
renderAmbiguityDashboard(demoPayload.statement_analysis, root);

window.renderAmbiguityDashboard = renderAmbiguityDashboard;
