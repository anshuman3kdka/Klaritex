const ELEMENT_ORDER = ["who", "action", "object", "measure", "when", "premise"];

const ELEMENT_LABELS = {
  who: "Who",
  action: "Action",
  object: "Object",
  measure: "How we measure",
  when: "When",
  premise: "Why",
};

const STATUS_CLASS = {
  CLEAR: "status-clear",
  BROAD: "status-broad",
  MISSING: "status-missing",
};

function normalizeStatus(status) {
  const normalized = String(status || "MISSING").toUpperCase();
  return STATUS_CLASS[normalized] ? normalized : "MISSING";
}

function safeText(value, fallback = "Not provided") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length ? text : fallback;
}

function renderVerdict(scoreData = {}) {
  const tier = safeText(scoreData.tier, "Tier unavailable");
  const score = Number(scoreData.ambiguity_score);
  const scoreLabel = Number.isFinite(score) ? `${score.toFixed(1)}/10` : "--/10";

  return `
    <article class="panel verdict-panel">
      <div>
        <p class="kicker">The Verdict</p>
        <h2 class="tier-text">${tier}</h2>
      </div>
      <div class="score-block">
        <p class="score-value">${scoreLabel}</p>
        <p class="score-caption">Ambiguity Score</p>
      </div>
    </article>
  `;
}

function renderAnchors(elements = {}) {
  const cards = ELEMENT_ORDER.map((key) => {
    const item = elements[key] || {};
    const status = normalizeStatus(item.status);
    const klass = STATUS_CLASS[status];

    return `
      <article class="anchor-row ${klass}">
        <div class="anchor-main">
          <p class="anchor-name">${ELEMENT_LABELS[key]}</p>
          <p class="anchor-content">${safeText(item.content)}</p>
          <p class="anchor-reason">${safeText(item.reasoning)}</p>
        </div>
        <span class="status-chip">${status}</span>
      </article>
    `;
  }).join("");

  return `
    <article class="panel">
      <div class="panel-head">
        <p class="kicker">The Anchors</p>
        <p class="panel-subtitle">Green = clear · Yellow = broad · Red = missing</p>
      </div>
      <div class="anchor-list">${cards}</div>
    </article>
  `;
}

function renderLiteralReality(text) {
  return `
    <article class="panel">
      <p class="kicker">Literal Reality</p>
      <div class="literal-box">
        ${safeText(text, "No literal translation available.")}
      </div>
    </article>
  `;
}

function renderTrap(assumptions = []) {
  const rows = assumptions.length
    ? assumptions
        .map(
          (item) => `
            <article class="trap-row">
              <div class="trap-side trap-side--left">
                <p class="trap-title">The Trap</p>
                <p>${safeText(item.assumption)}</p>
              </div>
              <div class="trap-side trap-side--right">
                <p class="trap-title">Literal Reality</p>
                <p>${safeText(item.reality)}</p>
              </div>
              <p class="trap-flaw">Why this is risky: ${safeText(item.flaw)}</p>
            </article>
          `
        )
        .join("")
    : `<p class="empty-note">No assumptions_to_avoid were returned in this analysis.</p>`;

  return `
    <article class="panel">
      <p class="kicker">The Trap</p>
      <div class="trap-list">${rows}</div>
    </article>
  `;
}

export function renderAmbiguityDashboard(statementAnalysis, mountNode) {
  if (!mountNode) {
    throw new Error("renderAmbiguityDashboard needs a mount node.");
  }

  if (!statementAnalysis) {
    mountNode.innerHTML = `
      <article class="panel">
        <p class="kicker">Ambiguity Dashboard</p>
        <p class="empty-note">Waiting for statement_analysis data.</p>
      </article>
    `;
    return;
  }

  const data = statementAnalysis;
  const scoreData = data.ambiguity_score_data || {};
  const elements = data.elements || {};
  const assumptions = Array.isArray(data.assumptions_to_avoid)
    ? data.assumptions_to_avoid
    : [];

  mountNode.innerHTML = `
    <section class="dashboard-layout">
      ${renderVerdict(scoreData)}
      ${renderAnchors(elements)}
      ${renderLiteralReality(data.literal_translation)}
      ${renderTrap(assumptions)}
    </section>
  `;
}

const root = document.getElementById("dashboard-root");
const bootData = window.statement_analysis || window.__STATEMENT_ANALYSIS__ || null;
renderAmbiguityDashboard(bootData, root);

window.renderAmbiguityDashboard = renderAmbiguityDashboard;
