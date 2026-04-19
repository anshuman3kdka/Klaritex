#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const LIVE_BASE_URL = process.env.LIVE_BASE_URL;
const SKIP_LIVE_CHECK = process.env.SKIP_LIVE_CHECK;
const LIVE_TIMEOUT_MS = Number.parseInt(process.env.LIVE_TIMEOUT_MS ?? "45000", 10);
const MAX_SCENARIO_MS = Number.parseInt(process.env.LIVE_SCENARIO_MAX_MS ?? "60000", 10);

if (SKIP_LIVE_CHECK === "1") {
  console.log("SKIP_LIVE_CHECK=1 -> live smoke check skipped.");
  process.exit(0);
}

if (!LIVE_BASE_URL) {
  console.error("Missing LIVE_BASE_URL. Example: LIVE_BASE_URL=https://your-live-site.com npm run live:check");
  process.exit(1);
}

function buildUrl(baseUrl, endpoint) {
  return new URL(endpoint, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`).toString();
}

function hasExpectedShape(payload) {
  if (!payload || typeof payload !== "object") return false;

  const objectPayload = payload;

  const hasValidAmbiguityScore =
    typeof objectPayload.ambiguityScore === "number" && Number.isFinite(objectPayload.ambiguityScore);

  const hasValidElements =
    Array.isArray(objectPayload.elements) &&
    objectPayload.elements.length > 0 &&
    objectPayload.elements.every(
      (element) =>
        element &&
        typeof element === "object" &&
        typeof element.name === "string" &&
        typeof element.status === "string" &&
        typeof element.penalty === "number"
    );

  return hasValidAmbiguityScore && hasValidElements;
}

async function timedRequest(name, makeRequest) {
  const startedAt = performance.now();

  let response;
  let payload;

  try {
    response = await makeRequest();
    const text = await response.text();

    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = { raw: text };
    }
  } catch (error) {
    return {
      name,
      ok: false,
      statusCode: null,
      elapsedMs: Math.round(performance.now() - startedAt),
      reason: error instanceof Error ? error.message : "Network request failed",
    };
  }

  const elapsedMs = Math.round(performance.now() - startedAt);

  if (!response.ok) {
    return {
      name,
      ok: false,
      statusCode: response.status,
      elapsedMs,
      reason:
        typeof payload?.error === "string"
          ? payload.error
          : `HTTP ${response.status}`,
    };
  }

  if (!hasExpectedShape(payload)) {
    return {
      name,
      ok: false,
      statusCode: response.status,
      elapsedMs,
      reason: "Missing required analysis fields (ambiguityScore/elements)",
    };
  }

  if (Number.isFinite(MAX_SCENARIO_MS) && elapsedMs > MAX_SCENARIO_MS) {
    return {
      name,
      ok: false,
      statusCode: response.status,
      elapsedMs,
      reason: `Timeout threshold exceeded (${elapsedMs}ms > ${MAX_SCENARIO_MS}ms)`,
    };
  }

  return {
    name,
    ok: true,
    statusCode: response.status,
    elapsedMs,
    reason: "",
  };
}

function printSummary(results) {
  const rows = results.map((item) => ({
    scenario: item.name,
    status: item.ok ? "PASS" : "FAIL",
    reason: item.ok ? `HTTP ${item.statusCode} in ${item.elapsedMs}ms` : item.reason,
  }));

  const widths = {
    scenario: Math.max("Scenario".length, ...rows.map((row) => row.scenario.length)),
    status: Math.max("Result".length, ...rows.map((row) => row.status.length)),
    reason: Math.max("Reason".length, ...rows.map((row) => row.reason.length)),
  };

  const line = `+-${"-".repeat(widths.scenario)}-+-${"-".repeat(widths.status)}-+-${"-".repeat(widths.reason)}-+`;

  console.log("\nLive smoke check summary");
  console.log(line);
  console.log(
    `| ${"Scenario".padEnd(widths.scenario)} | ${"Result".padEnd(widths.status)} | ${"Reason".padEnd(widths.reason)} |`
  );
  console.log(line);

  for (const row of rows) {
    console.log(
      `| ${row.scenario.padEnd(widths.scenario)} | ${row.status.padEnd(widths.status)} | ${row.reason.padEnd(widths.reason)} |`
    );
  }

  console.log(line);
}

async function main() {
  const textFixturePath = path.join(repoRoot, "tests/fixtures/sample-text.txt");
  const urlFixturePath = path.join(repoRoot, "tests/fixtures/sample-url.txt");
  const pdfFixturePath = path.join(repoRoot, "tests/fixtures/tiny-test.pdf");

  const [sampleText, sampleUrl, samplePdf] = await Promise.all([
    readFile(textFixturePath, "utf8"),
    readFile(urlFixturePath, "utf8"),
    readFile(pdfFixturePath),
  ]);

  const textPayload = {
    text: sampleText.trim(),
    mode: "quick",
  };

  const urlPayload = {
    url: sampleUrl.trim(),
    mode: "quick",
  };

  const scenarios = [
    {
      name: "Text analysis",
      run: () =>
        fetch(buildUrl(LIVE_BASE_URL, "/api/analyze"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(textPayload),
          signal: AbortSignal.timeout(LIVE_TIMEOUT_MS),
        }),
    },
    {
      name: "PDF analysis",
      run: () => {
        const form = new FormData();
        form.set("mode", "quick");
        form.set("file", new Blob([samplePdf], { type: "application/pdf" }), "tiny-test.pdf");

        return fetch(buildUrl(LIVE_BASE_URL, "/api/analyze-pdf"), {
          method: "POST",
          body: form,
          signal: AbortSignal.timeout(LIVE_TIMEOUT_MS),
        });
      },
    },
    {
      name: "URL analysis",
      run: () =>
        fetch(buildUrl(LIVE_BASE_URL, "/api/analyze-url"), {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(urlPayload),
          signal: AbortSignal.timeout(LIVE_TIMEOUT_MS),
        }),
    },
  ];

  const results = [];

  for (const scenario of scenarios) {
    // keep output short and beginner-friendly
    const result = await timedRequest(scenario.name, scenario.run);
    results.push(result);
    if (result.ok) {
      console.log(`${scenario.name}: PASS`);
    } else {
      console.log(`${scenario.name}: FAIL - ${result.reason}`);
    }
  }

  printSummary(results);

  const failed = results.filter((item) => !item.ok);
  if (failed.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Live smoke check crashed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
