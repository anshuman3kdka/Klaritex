"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ModeToggle } from "@/components/analyzer/ModeToggle";
import { PdfUpload } from "@/components/analyzer/PdfUpload";
import { UrlInput, isValidHttpUrl } from "@/components/analyzer/UrlInput";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { generateAnalysisPdf } from "@/lib/report/generateAnalysisPdf";
import type { AnalysisMode, AnalysisResult, InputMode } from "@/lib/types";
import type { ReportInputSource } from "@/lib/report/generateAnalysisPdf";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";

export type InputPanelIntent = {
  id: number;
  inputMode?: InputMode;
  processingMode?: AnalysisMode;
  text?: string;
  focusTextInput?: boolean;
};

type InputPanelProps = {
  intent?: InputPanelIntent | null;
  id?: string;
};

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
        className="k-icon-16"
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
        className="k-icon-16"
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
        className="k-icon-16"
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

async function readApiPayload(response: Response): Promise<AnalysisResult | { error?: string }> {
  const rawBody = await response.text();
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const isJson = contentType.includes("application/json");

  if (!rawBody.trim()) {
    throw new Error("The server returned an empty response. Please try again.");
  }

  if (!isJson) {
    const lower = rawBody.toLowerCase();

    if (lower.includes("504") || lower.includes("timed out") || lower.includes("gateway timeout")) {
      return { error: "Deep analysis took too long on the server. Please retry with shorter text." };
    }

    if (lower.includes("502") || lower.includes("bad gateway")) {
      return { error: "AI service is temporarily unavailable. Please try again in a moment." };
    }

    if (!response.ok) {
      return { error: `Server error (${response.status}). Please try again.` };
    }

    throw new Error("The server returned an unexpected response format. Please try again.");
  }

  try {
    return JSON.parse(rawBody) as AnalysisResult | { error?: string };
  } catch {
    if (!response.ok) {
      return { error: `Server error (${response.status}). Please try again.` };
    }
    throw new Error("The server returned an invalid response. Please try again.");
  }
}

export function InputPanel({ intent, id }: InputPanelProps) {
  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [processingMode, setProcessingMode] = useState<AnalysisMode>("quick");
  const [textInput, setTextInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState<AnalysisResult | null>(null);
  const [lastSource, setLastSource] = useState<ReportInputSource | null>(null);
  const [lastProcessingMode, setLastProcessingMode] = useState<AnalysisMode>("quick");
  const [analyzeButtonState, setAnalyzeButtonState] = useState<AnalyzeButtonState>("idle-disabled");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });
  const [hoverIndicatorStyle, setHoverIndicatorStyle] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  });
  const [isResetShaking, setIsResetShaking] = useState(false);
  const [rotatingTab, setRotatingTab] = useState<InputMode | null>(null);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const [isAnalyzePressed, setIsAnalyzePressed] = useState(false);
  const tabListRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<Record<InputMode, HTMLButtonElement | null>>({
    text: null,
    pdf: null,
    url: null,
  });
  const hasMountedRef = useRef(false);
  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);

  const isNearLimit = textInput.length >= WARNING_THRESHOLD;
  const textHasError = inputMode === "text" && Boolean(errorMessage);

  const hasInput =
    (inputMode === "text" && textInput.trim().length > 0) ||
    (inputMode === "pdf" && pdfFile !== null) ||
    (inputMode === "url" && urlInput.trim().length > 0);

  const canAnalyze = !isAnalyzing && hasInput;

  const hasContentInMode = (mode: InputMode): boolean => {
    if (mode === "text") {
      return textInput.trim().length > 0;
    }

    if (mode === "pdf") {
      return pdfFile !== null;
    }

    return urlInput.trim().length > 0;
  };

  const updateActiveIndicatorPosition = useCallback(() => {
    const tabListEl = tabListRef.current;
    const activeTabEl = tabRefs.current[inputMode];

    if (!tabListEl || !activeTabEl) {
      return;
    }

    const containerRect = tabListEl.getBoundingClientRect();
    const tabRect = activeTabEl.getBoundingClientRect();

    setActiveIndicatorStyle({
      left: tabRect.left - containerRect.left,
      width: tabRect.width,
    });
  }, [inputMode]);


  const getIndicatorTransform = ({ left, width }: { left: number; width: number }) => `translateX(${left}px) scaleX(${Math.max(width, 1)})`;

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
    if (nextMode === inputMode) {
      return;
    }

    const currentModeHasContent = hasContentInMode(inputMode);

    if (
      currentModeHasContent &&
      !window.confirm("Switching tabs will clear your current input. Continue?")
    ) {
      return;
    }

    if (currentModeHasContent) {
      setIsResetShaking(true);
      window.setTimeout(() => setIsResetShaking(false), 360);
    }

    setInputMode(nextMode);
    setTextInput("");
    setPdfFile(null);
    setUrlInput("");
    setErrorMessage(null);
    setHoverIndicatorStyle((previous) => ({ ...previous, visible: false }));
  }

  function handleTabListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const currentIndex = TABS.findIndex((tab) => tab.value === inputMode);

    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextTab = TABS[(currentIndex + 1) % TABS.length];
      handleTabSwitch(nextTab.value);
      tabRefs.current[nextTab.value]?.focus();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const nextTab = TABS[(currentIndex - 1 + TABS.length) % TABS.length];
      handleTabSwitch(nextTab.value);
      tabRefs.current[nextTab.value]?.focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      handleTabSwitch(TABS[0].value);
      tabRefs.current[TABS[0].value]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      const lastTab = TABS[TABS.length - 1];
      handleTabSwitch(lastTab.value);
      tabRefs.current[lastTab.value]?.focus();
    }
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

    if (window.matchMedia("(max-width: 768px)").matches) {
      setIsAnalyzePressed(true);
      await new Promise((resolve) => window.setTimeout(resolve, 100));
      setIsAnalyzePressed(false);
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

      const payload = await readApiPayload(response);

      if (!response.ok) {
        const apiMessage = "error" in payload && payload.error ? payload.error : "Analysis failed.";
        throw new Error(normalizeErrorMessage(apiMessage, inputMode));
      }

      setLastResult(payload as AnalysisResult);
      setLastSource({
        mode: inputMode,
        text: inputMode === "text" ? textInput.trim() : undefined,
        url: inputMode === "url" ? urlInput.trim() : undefined,
        fileName: inputMode === "pdf" ? pdfFile?.name : undefined,
      });
      setLastProcessingMode(processingMode);
      analysisSucceeded = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Analysis failed.";
      setErrorMessage(normalizeErrorMessage(message, inputMode));
    } finally {
      setIsAnalyzing(false);
      setAnalyzeButtonState(analysisSucceeded ? "complete" : hasInput ? "idle-active" : "idle-disabled");
    }
  }

  async function handleDownloadPdf() {
    if (!lastResult || !lastSource) {
      return;
    }

    setIsGeneratingPdf(true);

    try {
      generateAnalysisPdf({
        result: lastResult,
        source: lastSource,
        processingMode: lastProcessingMode,
      });
    } finally {
      setIsGeneratingPdf(false);
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
    updateActiveIndicatorPosition();
  }, [updateActiveIndicatorPosition]);

  useEffect(() => {
    const handleResize = () => {
      updateActiveIndicatorPosition();
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [updateActiveIndicatorPosition]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    setRotatingTab(inputMode);
    const timer = window.setTimeout(() => setRotatingTab(null), 400);

    return () => window.clearTimeout(timer);
  }, [inputMode]);

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

  useEffect(() => {
    if (!intent) {
      return;
    }

    if (intent.inputMode) {
      setInputMode(intent.inputMode);
      setErrorMessage(null);

      if (intent.inputMode !== "text") {
        setTextInput("");
      }

      if (intent.inputMode !== "pdf") {
        setPdfFile(null);
      }

      if (intent.inputMode !== "url") {
        setUrlInput("");
      }
    }

    if (intent.processingMode) {
      setProcessingMode(intent.processingMode);
    }

    if (typeof intent.text === "string") {
      const nextText = intent.text.slice(0, MAX_TEXT_LENGTH);
      setTextInput(nextText);
      setInputMode("text");
      setErrorMessage(null);
    }

    if (intent.focusTextInput || typeof intent.text === "string") {
      setInputMode("text");
      window.requestAnimationFrame(() => {
        textAreaRef.current?.focus();
      });
    }
  }, [intent]);

  return (
    <>
      <LabCard id={id} className="k-entrance-fade-down mx-auto w-full max-w-3xl p-6 sm:p-8" style={cardAnimationStyle}>
        <div
          ref={tabListRef}
          className="relative grid grid-cols-1 gap-2 sm:grid-cols-3 mb-6"
          role="tablist"
          aria-label="Input mode"
          onKeyDown={handleTabListKeyDown}
        >
          {TABS.map((tab, index) => {
            const isActive = inputMode === tab.value;

            return (
              <button
                key={tab.value}
                ref={(element) => {
                  tabRefs.current[tab.value] = element;
                }}
                role="tab"
                aria-selected={isActive}
                aria-controls={`input-panel-${inputMode}`}
                id={`input-tab-${tab.value}`}
                type="button"
                onClick={() => handleTabSwitch(tab.value)}
                style={tabAnimationStyle(index)}
                className={`k-entrance-fade-down p-3 rounded-[8px] text-left transition-[box-shadow,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50 ${
                  isActive
                    ? "shadow-[var(--shadow-pressed)] text-[var(--lab-gold)] bg-[var(--lab-surface)]"
                    : "shadow-[var(--shadow-extruded)] text-[var(--lab-muted)] hover:text-[var(--lab-ink)] hover:shadow-[var(--shadow-pressed)]"
                }`}
              >
                <p className="font-sans font-semibold text-sm flex items-center justify-center">
                  <span className={`mr-2 ${rotatingTab === tab.value ? "tab-icon-rotate" : ""}`} aria-hidden>
                    {tab.icon}
                  </span>
                  {tab.label}
                </p>
              </button>
            );
          })}
        </div>

        <div
          className={`mt-6 ${isResetShaking ? "clear-reset-shake" : ""}`}
          role="tabpanel"
          id={`input-panel-${inputMode}`}
          aria-labelledby={`input-tab-${inputMode}`}
        >
          {inputMode === "text" ? (
            <>
              <LabLabel className="mb-2 block">
                <label htmlFor="klaritex-text-input">Text to analyze</label>
              </LabLabel>
              <div
                className={`overflow-hidden transition-[max-height] duration-300 ease-out md:max-h-none ${
                  isTextInputFocused ? "max-h-[200px] h-[200px]" : "max-h-[120px] h-[120px]"
                } md:h-auto`}
              >
                <div className="flex h-full flex-col md:block">
                  <textarea
                    ref={textAreaRef}
                    id="klaritex-text-input"
                    value={textInput}
                    onFocus={() => setIsTextInputFocused(true)}
                    onBlur={() => setIsTextInputFocused(false)}
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
                    aria-invalid={textHasError}
                    aria-describedby={textHasError ? "klaritex-text-count klaritex-text-message" : "klaritex-text-count"}
                    className={`font-sans w-full bg-[var(--lab-surface)] p-4 outline-none transition-[box-shadow,background-color] duration-200 rounded-[8px] disabled:cursor-not-allowed disabled:opacity-50 ${
                      textHasError
                        ? "shadow-[var(--shadow-pressed)] ring-2 ring-[var(--lab-red)]"
                        : "shadow-[var(--shadow-pressed)] focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50"
                    }`}
                    style={{ resize: "vertical", minHeight: "160px" }}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <p
                      id="klaritex-text-count"
                      className={`font-mono text-xs ${isNearLimit ? "text-[var(--lab-amber)]" : "text-[var(--lab-muted)]"}`}
                    >
                      {textInput.length.toLocaleString()} / {MAX_TEXT_LENGTH.toLocaleString()}
                      {isNearLimit && " (approaching limit)"}
                    </p>
                    {textInput.length > 0 && !isAnalyzing && (
                      <button
                        type="button"
                        onClick={() => {
                          setTextInput("");
                          setErrorMessage(null);
                        }}
                        className="font-sans text-xs font-semibold text-[var(--lab-muted)] hover:text-[var(--lab-red)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-red)]/50 rounded-sm"
                        aria-label="Clear text input"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
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

        <div className="mt-8 mb-8">
          <div className="h-px w-full bg-[var(--lab-shadow-dark)] opacity-20" />
        </div>

        <div className="mt-6">
          <ModeToggle value={processingMode} onChange={setProcessingMode} disabled={isAnalyzing} />
        </div>

        <div className="mt-8">
          <LabButton
            onClick={handleAnalyze}
            disabled={!canAnalyze || analyzeButtonState === "complete"}
            activeGlow={analyzeButtonState === "loading"}
            style={analyzeButtonAnimationStyle}
            className="w-full h-14"
          >
            {analyzeButtonState === "loading" ? (
              <div className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--lab-ink)] border-t-transparent" />
                <span>Analyzing...</span>
              </div>
            ) : analyzeButtonState === "complete" ? (
              <div className="flex items-center justify-center gap-2">
                <span aria-hidden>✓</span>
                <span>Done</span>
              </div>
            ) : (
              "Analyze"
            )}
          </LabButton>
        </div>

        {analysisStateMessage && (
          <p className="font-sans mt-4 text-[var(--lab-muted)] text-center text-sm" role="status" aria-live="polite">
            {analysisStateMessage}
          </p>
        )}

        {lastResult && lastSource ? (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="font-sans inline-flex items-center gap-2 text-sm text-[var(--lab-muted)] hover:text-[var(--lab-ink)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50 rounded-sm"
            >
              {isGeneratingPdf ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--lab-muted)] border-t-transparent" />
                  Generating...
                </>
              ) : (
                <>
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
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Report
                </>
              )}
            </button>
          </div>
        ) : null}
        {inputMode === "text" ? (
          <p
            id="klaritex-text-message"
            role={textHasError ? "alert" : "status"}
            aria-live={textHasError ? "assertive" : "polite"}
            className={`font-sans mt-2 min-h-5 text-sm ${textHasError ? "text-[var(--lab-red)]" : "text-transparent"}`}
          >
            {errorMessage ?? "Text looks good."}
          </p>
        ) : null}
      </LabCard>

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

        .clear-reset-shake {
          animation: clearResetShake 320ms ease;
        }

        .tab-icon-rotate {
          animation: tabIconRotate 400ms ease;
        }

        @keyframes clearResetShake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-5px);
          }
          40% {
            transform: translateX(5px);
          }
          60% {
            transform: translateX(-3px);
          }
          80% {
            transform: translateX(3px);
          }
        }

        @keyframes tabIconRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </>
  );
}
