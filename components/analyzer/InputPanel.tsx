"use client";

import { useMemo, useState } from "react";

import { ModeToggle } from "@/components/analyzer/ModeToggle";
import { PdfUpload } from "@/components/analyzer/PdfUpload";
import { UrlInput, isValidHttpUrl } from "@/components/analyzer/UrlInput";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import type { AnalysisMode, AnalysisResult, InputMode } from "@/lib/types";

const MAX_TEXT_LENGTH = 10_000;
const WARNING_THRESHOLD = Math.floor(MAX_TEXT_LENGTH * 0.9);

const TABS: Array<{ value: InputMode; label: string; icon: string }> = [
  { value: "text", label: "Paste Text", icon: "📝" },
  { value: "pdf", label: "Upload PDF", icon: "📄" },
  { value: "url", label: "Analyze URL", icon: "🔗" },
];

function normalizeErrorMessage(message: string, mode: InputMode): string {
  const lowercase = message.toLowerCase();

  if (lowercase.includes("analysis parsing failed")) {
    return "Something went wrong reading the analysis. Please retry.";
  }

  if (lowercase.includes("gemini") || lowercase.includes("analysis failed")) {
    return "Analysis failed. Please try again in a moment.";
  }

  if (mode === "pdf" && lowercase.includes("pdf contains no extractable text")) {
    return "This PDF doesn't contain readable text. Try a different file.";
  }

  if (mode === "url" && lowercase.includes("could not fetch content from")) {
    return "Could not fetch content from this URL. Check the address and try again.";
  }

  return message;
}

export function InputPanel() {
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [processingMode, setProcessingMode] = useState<AnalysisMode>("quick");
  const [textInput, setTextInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null);

  const isNearLimit = textInput.length >= WARNING_THRESHOLD;

  const canAnalyze =
    !isAnalyzing &&
    ((inputMode === "text" && textInput.trim().length > 0) ||
      (inputMode === "pdf" && pdfFile !== null) ||
      (inputMode === "url" && urlInput.trim().length > 0));

  const analysisStateMessage = useMemo(() => {
    if (isAnalyzing) {
      return "Analyzing your text now...";
    }

    if (lastResult) {
      return `Done. Latest Ambiguity Score: ${lastResult.ambiguityScore.toFixed(1)} / 10`;
    }

    return null;
  }, [isAnalyzing, lastResult]);

  function handleTabSwitch(nextMode: InputMode) {
    setInputMode(nextMode);
    setTextInput("");
    setPdfFile(null);
    setUrlInput("");
    setErrorMessage(null);
  }

  async function handleAnalyze() {
    if (!canAnalyze) {
      return;
    }

    if (inputMode === "url" && !isValidHttpUrl(urlInput)) {
      setErrorMessage("Please enter a valid URL starting with http:// or https://.");
      setLastResult(null);
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      let response: Response;

      if (inputMode === "text") {
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: textInput,
            mode: processingMode,
          }),
        });
      } else if (inputMode === "pdf") {
        if (!pdfFile) {
          setErrorMessage("PDF file is required.");
          setLastResult(null);
          return;
        }

        const formData = new FormData();
        formData.append("file", pdfFile);
        formData.append("mode", processingMode);

        response = await fetch("/api/analyze-pdf", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/analyze-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: urlInput.trim(),
            mode: processingMode,
          }),
        });
      }

      const payload = (await response.json()) as AnalysisResult | { error?: string };

      if (!response.ok) {
        const apiMessage = "error" in payload && payload.error ? payload.error : "Analysis failed.";
        throw new Error(normalizeErrorMessage(apiMessage, inputMode));
      }

      setLastResult(payload as AnalysisResult);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed.";
      setErrorMessage(normalizeErrorMessage(message, inputMode));
      setLastResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {TABS.map((tab) => {
          const isActive = inputMode === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleTabSwitch(tab.value)}
              className={`rounded-lg border px-4 py-3 text-left transition ${
                isActive
                  ? "border-indigo-600 bg-indigo-50 ring-1 ring-indigo-200"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              <p className="font-medium text-slate-900">
                <span className="mr-2" aria-hidden>
                  {tab.icon}
                </span>
                {tab.label}
              </p>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {inputMode === "text" ? (
          <>
            <label htmlFor="klaritex-text-input" className="mb-2 block text-sm font-medium text-slate-900">
              Text to analyze
            </label>
            <textarea
              id="klaritex-text-input"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value.slice(0, MAX_TEXT_LENGTH))}
              maxLength={MAX_TEXT_LENGTH}
              rows={10}
              disabled={isAnalyzing}
              placeholder="Paste a political statement, policy claim, corporate announcement, or any text you want analyzed..."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
            <p className={`mt-2 text-sm ${isNearLimit ? "text-amber-600" : "text-slate-500"}`}>
              {textInput.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
              {isNearLimit && " (approaching limit)"}
            </p>
          </>
        ) : null}

        {inputMode === "pdf" ? (
          <PdfUpload
            value={pdfFile}
            disabled={isAnalyzing}
            errorMessage={errorMessage}
            onFileChange={(file) => {
              setPdfFile(file);
              setErrorMessage(null);
            }}
          />
        ) : null}

        {inputMode === "url" ? (
          <UrlInput
            value={urlInput}
            disabled={isAnalyzing}
            errorMessage={errorMessage}
            onChange={(value) => {
              setUrlInput(value);
              setErrorMessage(null);
            }}
          />
        ) : null}
      </div>

      <div className="mt-6">
        <ModeToggle value={processingMode} onChange={setProcessingMode} disabled={isAnalyzing} />
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isAnalyzing ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Analyzing...
            </>
          ) : (
            "Analyze"
          )}
        </button>
      </div>

      {analysisStateMessage && <p className="mt-4 text-sm text-slate-600">{analysisStateMessage}</p>}
      {errorMessage && inputMode === "text" && <p className="mt-2 text-sm text-red-600">{errorMessage}</p>}

      {lastResult && <ResultsPanel result={lastResult} />}
    </section>
  );
}
