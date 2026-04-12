"use client";

import { useEffect, useMemo, useState } from "react";

import { ModeToggle } from "@/components/analyzer/ModeToggle";
import { PdfUpload } from "@/components/analyzer/PdfUpload";
import { UrlInput, isValidHttpUrl } from "@/components/analyzer/UrlInput";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import type { AnalysisMode, AnalysisResult, InputMode } from "@/lib/types";
import type { CSSProperties, ReactNode } from "react";

const MAX_TEXT_LENGTH = 10_000;
const WARNING_THRESHOLD = Math.floor(MAX_TEXT_LENGTH * 0.9);
const INPUT_CARD_DELAY_MS = 750;
const TAB_STAGGER_MS = 80;
const TABS_START_DELAY_MS = 1_350;
const ANALYZE_BUTTON_DELAY_MS = 2_190;
const COMPLETE_STATE_DURATION_MS = 800;

type AnalyzeButtonState = "idle-active" | "idle-disabled" | "loading" | "complete";

const TABS: Array<{ value: InputMode; label: string; icon: ReactNode }> = [
  {
    value: "text",
    label: "Paste Text",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    value: "pdf",
    label: "Upload PDF",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    value: "url",
    label: "Analyze URL",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
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
    return "This PDF doesn't contain readable text.";
  }

  if (mode === "url" && lowercase.includes("could not fetch content from")) {
    return "Could not fetch content from this URL.";
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
  const [analyzeButtonState, setAnalyzeButtonState] = useState<AnalyzeButtonState>("idle-disabled");

  const isNearLimit = textInput.length >= WARNING_THRESHOLD;

  const hasInput =
    (inputMode === "text" && textInput.trim().length > 0) ||
    (inputMode === "pdf" && pdfFile !== null) ||
    (inputMode === "url" && urlInput.trim().length > 0);

  const canAnalyze = !isAnalyzing && hasInput;

  const analysisStateMessage = useMemo(() => {
    if (isAnalyzing) {
      return "Analyzing...";
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
      return;
    }

    if (inputMode === "text" && textInput.length > MAX_TEXT_LENGTH) {
      setErrorMessage("Input is too long. Maximum is 10,000 characters.");
      return;
    }

    let analysisSucceeded = false;

    setIsAnalyzing(true);
    setAnalyzeButtonState("loading");
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
      analysisSucceeded = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed.";
      setErrorMessage(normalizeErrorMessage(message, inputMode));
    } finally {
      setIsAnalyzing(false);
      setAnalyzeButtonState(analysisSucceeded ? "complete" : hasInput ? "idle-active" : "idle-disabled");
    }
  }

  const cardAnimationStyle: CSSProperties = {
    animationDelay: `${INPUT_CARD_DELAY_MS}ms`,
  };

  const tabAnimationStyle = (index: number): CSSProperties => ({
    animationDelay: `${TABS_START_DELAY_MS + index * TAB_STAGGER_MS}ms`,
  });

  const analyzeButtonAnimationStyle: CSSProperties = {
    animationDelay: `${ANALYZE_BUTTON_DELAY_MS}ms`,
  };

  useEffect(() => {
    if (isAnalyzing) {
      setAnalyzeButtonState("loading");
      return;
    }

    if (analyzeButtonState === "complete") {
      return;
    }

    setAnalyzeButtonState(hasInput ? "idle-active" : "idle-disabled");
  }, [analyzeButtonState, hasInput, isAnalyzing]);

  useEffect(() => {
    if (analyzeButtonState !== "complete") {
      return;
    }

    const timer = window.setTimeout(() => {
      setAnalyzeButtonState(hasInput ? "idle-active" : "idle-disabled");
    }, COMPLETE_STATE_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [analyzeButtonState, hasInput]);

  return (
    <>
      <section className="k-card k-entrance-fade-down mx-auto w-full max-w-3xl p-4 sm:p-6" style={cardAnimationStyle}>
        <div className="grid grid-cols-1 gap-2 border-b border-[var(--border)] pb-2 sm:grid-cols-3" role="tablist">
          {TABS.map((tab, index) => {
            const isActive = inputMode === tab.value;

            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                type="button"
                onClick={() => handleTabSwitch(tab.value)}
                style={tabAnimationStyle(index)}
                className={`k-entrance-fade-down font-ui rounded-none border-b-2 px-2 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 ${
                  isActive
                    ? "border-[var(--border-accent)] text-[var(--text-gold)]"
                    : "border-transparent text-[var(--text-secondary)] hover:border-[var(--gold-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <p className="font-medium flex items-center">
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
              <label htmlFor="klaritex-text-input" className="font-ui mb-2 block text-sm font-medium text-[var(--text-primary)]">
                Text to analyze
              </label>
              <textarea
                id="klaritex-text-input"
                value={textInput}
                onChange={(event) => {
                  const nextValue = event.target.value;

                  if (nextValue.length > MAX_TEXT_LENGTH) {
                    setTextInput(nextValue.slice(0, MAX_TEXT_LENGTH));
                    setErrorMessage("Input is too long. Maximum is 10,000 characters.");
                    return;
                  }

                  setTextInput(nextValue);
                  if (errorMessage === "Input is too long. Maximum is 10,000 characters.") {
                    setErrorMessage(null);
                  }
                }}
                maxLength={MAX_TEXT_LENGTH}
                rows={10}
                disabled={isAnalyzing}
                placeholder="Paste a political statement, policy claim, corporate announcement, or any text you want analyzed..."
                className="font-ui w-full rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-3 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--gold-primary)] focus:ring-2 focus:ring-[var(--gold-primary)]/20 disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)]"
              />
              <p className={`font-mono-ui mt-2 text-sm ${isNearLimit ? "text-[var(--tier2-color)]" : "text-[var(--text-secondary)]"}`}>
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
            disabled={!canAnalyze || analyzeButtonState === "complete"}
            style={analyzeButtonAnimationStyle}
            className={`k-entrance-scale-in analyze-button font-ui relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg px-5 py-3 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 ${
              analyzeButtonState === "idle-active"
                ? "analyze-button--idle-active"
                : analyzeButtonState === "idle-disabled"
                  ? "analyze-button--idle-disabled"
                  : analyzeButtonState === "loading"
                    ? "analyze-button--loading"
                    : "analyze-button--complete"
            }`}
          >
            {analyzeButtonState === "loading" ? (
              <>
                <span className="analyze-button__spinner" aria-hidden />
                <span>Analyzing...</span>
              </>
            ) : analyzeButtonState === "complete" ? (
              <>
                <span aria-hidden>✓</span>
                <span>Done</span>
              </>
            ) : (
              "Analyze"
            )}
          </button>
        </div>

        {analysisStateMessage && <p className="font-ui mt-4 text-sm text-[var(--text-secondary)]">{analysisStateMessage}</p>}
        {errorMessage && inputMode === "text" && <p className="font-ui mt-2 text-sm text-[var(--missing-color)]">{errorMessage}</p>}
      </section>

      <ResultsPanel result={lastResult} isLoading={isAnalyzing} />

      <style jsx>{`
        .analyze-button {
          transition: all 300ms ease;
          color: #1a1a1a;
        }

        .analyze-button--idle-active {
          background: #c9a84c;
          opacity: 1;
          animation: goldPulse 2s infinite;
        }

        .analyze-button--idle-disabled {
          background: #c9a84c;
          opacity: 0.4;
          cursor: not-allowed;
          animation: none;
        }

        .analyze-button--loading {
          background: #a8853a;
          color: #1a1a1a;
        }

        .analyze-button--loading::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(100deg, transparent 0%, rgba(255, 255, 255, 0.28) 50%, transparent 100%);
          transform: translateX(-120%);
          animation: loadingShimmer 1.5s linear infinite;
          pointer-events: none;
        }

        .analyze-button--complete {
          background: #c9a84c;
          opacity: 1;
          animation: completeBounce ${COMPLETE_STATE_DURATION_MS}ms ease;
        }

        .analyze-button__spinner {
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          border: 2px solid #c9a84c;
          border-top-color: transparent;
          animation: spin 600ms linear infinite;
          z-index: 1;
        }

        @keyframes goldPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(201, 168, 76, 0);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(201, 168, 76, 0.3);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(201, 168, 76, 0);
          }
        }

        @keyframes loadingShimmer {
          100% {
            transform: translateX(120%);
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes completeBounce {
          0% {
            transform: scale(1);
          }
          45% {
            transform: scale(1.03);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
