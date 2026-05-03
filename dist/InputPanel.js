// components/analyzer/InputPanel.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ModeToggle } from "@/components/analyzer/ModeToggle";
import { PdfUpload } from "@/components/analyzer/PdfUpload";
import { UrlInput, isValidHttpUrl } from "@/components/analyzer/UrlInput";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { generateAnalysisPdf } from "@/lib/report/generateAnalysisPdf";
import { jsxDEV, Fragment } from "react/jsx-dev-runtime";
"use client";
var MAX_TEXT_LENGTH = 1e4;
var WARNING_THRESHOLD = Math.floor(MAX_TEXT_LENGTH * 0.9);
var INPUT_CARD_DELAY_MS = 750;
var TAB_STAGGER_MS = 80;
var TABS_START_DELAY_MS = 1350;
var ANALYZE_BUTTON_DELAY_MS = 2190;
var COMPLETE_STATE_DURATION_MS = 800;
var TABS = [
  {
    value: "text",
    label: "Paste Text",
    icon: /* @__PURE__ */ jsxDEV("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      className: "k-icon-16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M12 20h9"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this)
  },
  {
    value: "pdf",
    label: "Upload PDF",
    icon: /* @__PURE__ */ jsxDEV("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      className: "k-icon-16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("polyline", {
          points: "14 2 14 8 20 8"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("line", {
          x1: "16",
          y1: "13",
          x2: "8",
          y2: "13"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("line", {
          x1: "16",
          y1: "17",
          x2: "8",
          y2: "17"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("polyline", {
          points: "10 9 9 9 8 9"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this)
  },
  {
    value: "url",
    label: "Analyze URL",
    icon: /* @__PURE__ */ jsxDEV("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      className: "k-icon-16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: [
        /* @__PURE__ */ jsxDEV("path", {
          d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("path", {
          d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this)
  }
];
function normalizeErrorMessage(message, mode) {
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
async function readApiPayload(response) {
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
    return JSON.parse(rawBody);
  } catch {
    if (!response.ok) {
      return { error: `Server error (${response.status}). Please try again.` };
    }
    throw new Error("The server returned an invalid response. Please try again.");
  }
}
function InputPanel({ intent, id }) {
  const [inputMode, setInputMode] = useState("text");
  const [processingMode, setProcessingMode] = useState("quick");
  const [textInput, setTextInput] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [urlInput, setUrlInput] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [lastSource, setLastSource] = useState(null);
  const [lastProcessingMode, setLastProcessingMode] = useState("quick");
  const [analyzeButtonState, setAnalyzeButtonState] = useState("idle-disabled");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [activeIndicatorStyle, setActiveIndicatorStyle] = useState({ left: 0, width: 0 });
  const [hoverIndicatorStyle, setHoverIndicatorStyle] = useState({
    left: 0,
    width: 0,
    visible: false
  });
  const [isResetShaking, setIsResetShaking] = useState(false);
  const [rotatingTab, setRotatingTab] = useState(null);
  const [isTextInputFocused, setIsTextInputFocused] = useState(false);
  const [isAnalyzePressed, setIsAnalyzePressed] = useState(false);
  const tabListRef = useRef(null);
  const tabRefs = useRef({
    text: null,
    pdf: null,
    url: null
  });
  const hasMountedRef = useRef(false);
  const textAreaRef = useRef(null);
  const isNearLimit = textInput.length >= WARNING_THRESHOLD;
  const textHasError = inputMode === "text" && Boolean(errorMessage);
  const hasInput = inputMode === "text" && textInput.trim().length > 0 || inputMode === "pdf" && pdfFile !== null || inputMode === "url" && urlInput.trim().length > 0;
  const canAnalyze = !isAnalyzing && hasInput;
  const hasContentInMode = (mode) => {
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
      width: tabRect.width
    });
  }, [inputMode]);
  const getIndicatorTransform = ({ left, width }) => `translateX(${left}px) scaleX(${Math.max(width, 1)})`;
  const analysisStateMessage = useMemo(() => {
    if (isAnalyzing) {
      return "Analyzing...";
    }
    if (lastResult) {
      return `Done. Latest Ambiguity Score: ${lastResult.ambiguityScore.toFixed(1)} / 10`;
    }
    return null;
  }, [isAnalyzing, lastResult]);
  function handleTabSwitch(nextMode) {
    if (nextMode === inputMode) {
      return;
    }
    const currentModeHasContent = hasContentInMode(inputMode);
    if (currentModeHasContent && !window.confirm("Switching tabs will clear your current input. Continue?")) {
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
  function handleTabListKeyDown(event) {
    const currentIndex = TABS.findIndex((tab) => tab.value === inputMode);
    if (event.key === "ArrowRight") {
      event.preventDefault();
      const nextTab = TABS[(currentIndex + 1) % TABS.length];
      handleTabSwitch(nextTab.value);
      window.setTimeout(() => {
        tabRefs.current[nextTab.value]?.focus();
      }, 0);
      return;
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      const nextTab = TABS[(currentIndex - 1 + TABS.length) % TABS.length];
      handleTabSwitch(nextTab.value);
      window.setTimeout(() => {
        tabRefs.current[nextTab.value]?.focus();
      }, 0);
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      handleTabSwitch(TABS[0].value);
      window.setTimeout(() => {
        tabRefs.current[TABS[0].value]?.focus();
      }, 0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      const lastTab = TABS[TABS.length - 1];
      handleTabSwitch(lastTab.value);
      window.setTimeout(() => {
        tabRefs.current[lastTab.value]?.focus();
      }, 0);
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
      let response;
      if (inputMode === "text") {
        response = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            text: textInput,
            mode: processingMode
          })
        });
      } else if (inputMode === "pdf") {
        if (!pdfFile) {
          setErrorMessage("PDF file is required.");
          return;
        }
        const formData = new FormData;
        formData.append("file", pdfFile);
        formData.append("mode", processingMode);
        response = await fetch("/api/analyze-pdf", {
          method: "POST",
          body: formData
        });
      } else {
        response = await fetch("/api/analyze-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            url: urlInput.trim(),
            mode: processingMode
          })
        });
      }
      const payload = await readApiPayload(response);
      if (!response.ok) {
        const apiMessage = "error" in payload && payload.error ? payload.error : "Analysis failed.";
        throw new Error(normalizeErrorMessage(apiMessage, inputMode));
      }
      setLastResult(payload);
      setLastSource({
        mode: inputMode,
        text: inputMode === "text" ? textInput.trim() : undefined,
        url: inputMode === "url" ? urlInput.trim() : undefined,
        fileName: inputMode === "pdf" ? pdfFile?.name : undefined
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
        processingMode: lastProcessingMode
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  }
  const cardAnimationStyle = {
    animationDelay: `${INPUT_CARD_DELAY_MS}ms`
  };
  const tabAnimationStyle = (index) => ({
    animationDelay: `${TABS_START_DELAY_MS + index * TAB_STAGGER_MS}ms`
  });
  const analyzeButtonAnimationStyle = {
    animationDelay: `${ANALYZE_BUTTON_DELAY_MS}ms`
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
  return /* @__PURE__ */ jsxDEV(Fragment, {
    children: [
      /* @__PURE__ */ jsxDEV("section", {
        id,
        className: "k-card k-entrance-fade-down mx-auto w-full max-w-3xl p-4 sm:p-6",
        style: cardAnimationStyle,
        children: [
          /* @__PURE__ */ jsxDEV("div", {
            ref: tabListRef,
            className: "relative grid grid-cols-1 gap-2 border-b border-[var(--border)] pb-2 sm:grid-cols-3",
            role: "tablist",
            "aria-label": "Input mode",
            onKeyDown: handleTabListKeyDown,
            children: [
              /* @__PURE__ */ jsxDEV("div", {
                "aria-hidden": true,
                className: "pointer-events-none absolute bottom-0 h-[2px] w-px origin-left bg-[var(--gold-primary)]",
                style: {
                  transform: getIndicatorTransform(activeIndicatorStyle),
                  transition: "transform 180ms cubic-bezier(0.4, 0, 0.2, 1)"
                }
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("div", {
                "aria-hidden": true,
                className: "pointer-events-none absolute bottom-0 h-[2px] w-px origin-left bg-[var(--gold-primary)]",
                style: {
                  transform: getIndicatorTransform(hoverIndicatorStyle),
                  opacity: hoverIndicatorStyle.visible ? 0.36 : 0,
                  transition: "transform 180ms cubic-bezier(0.4, 0, 0.2, 1), opacity 150ms ease"
                }
              }, undefined, false, undefined, this),
              TABS.map((tab, index) => {
                const isActive = inputMode === tab.value;
                return /* @__PURE__ */ jsxDEV("button", {
                  ref: (element) => {
                    tabRefs.current[tab.value] = element;
                  },
                  role: "tab",
                  "aria-selected": isActive,
                  tabIndex: isActive ? 0 : -1,
                  "aria-controls": `input-panel-${inputMode}`,
                  id: `input-tab-${tab.value}`,
                  type: "button",
                  onClick: () => handleTabSwitch(tab.value),
                  onMouseEnter: () => {
                    if (isActive || !tabListRef.current || !tabRefs.current[tab.value]) {
                      return;
                    }
                    const containerRect = tabListRef.current.getBoundingClientRect();
                    const tabRect = tabRefs.current[tab.value].getBoundingClientRect();
                    setHoverIndicatorStyle({
                      left: tabRect.left - containerRect.left,
                      width: tabRect.width,
                      visible: true
                    });
                  },
                  onMouseLeave: () => {
                    setHoverIndicatorStyle((previous) => ({ ...previous, visible: false }));
                  },
                  style: tabAnimationStyle(index),
                  className: `k-entrance-fade-down font-ui relative rounded-none border-b-2 px-2 py-3 text-left transition-transform duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 ${isActive ? "border-[var(--gold-primary)] text-[var(--text-primary)]" : "border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`,
                  children: /* @__PURE__ */ jsxDEV("p", {
                    className: "font-medium flex items-center",
                    children: [
                      /* @__PURE__ */ jsxDEV("span", {
                        className: `mr-2 ${rotatingTab === tab.value ? "tab-icon-rotate" : ""}`,
                        "aria-hidden": true,
                        children: tab.icon
                      }, undefined, false, undefined, this),
                      tab.label
                    ]
                  }, undefined, true, undefined, this)
                }, tab.value, false, undefined, this);
              })
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: `mt-5 ${isResetShaking ? "clear-reset-shake" : ""}`,
            role: "tabpanel",
            id: `input-panel-${inputMode}`,
            "aria-labelledby": `input-tab-${inputMode}`,
            children: [
              inputMode === "text" ? /* @__PURE__ */ jsxDEV(Fragment, {
                children: [
                  /* @__PURE__ */ jsxDEV("label", {
                    htmlFor: "klaritex-text-input",
                    className: "font-ui k-text-heading mb-2 block",
                    children: "Text to analyze"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("div", {
                    className: `overflow-hidden transition-[max-height] duration-300 ease-out md:max-h-none ${isTextInputFocused ? "max-h-[200px] h-[200px]" : "max-h-[120px] h-[120px]"} md:h-auto`,
                    children: /* @__PURE__ */ jsxDEV("div", {
                      className: "flex h-full flex-col md:block",
                      children: [
                        /* @__PURE__ */ jsxDEV("textarea", {
                          ref: textAreaRef,
                          id: "klaritex-text-input",
                          value: textInput,
                          onFocus: () => setIsTextInputFocused(true),
                          onBlur: () => setIsTextInputFocused(false),
                          onChange: (event) => {
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
                          },
                          maxLength: MAX_TEXT_LENGTH,
                          rows: 10,
                          disabled: isAnalyzing,
                          placeholder: "Paste a political statement, policy claim, corporate announcement, or any text you want analyzed...",
                          "aria-invalid": textHasError,
                          "aria-describedby": textHasError ? "klaritex-text-count klaritex-text-message" : "klaritex-text-count",
                          className: `font-ui k-radius-primary k-text-body h-full w-full border bg-[var(--bg-primary)] p-3 outline-none transition-[border-color,box-shadow,background-color] duration-200 disabled:cursor-not-allowed disabled:bg-[var(--bg-elevated)] md:h-auto ${textHasError ? "border-[var(--missing-color)] focus-visible:border-[var(--missing-color)] focus-visible:ring-2 focus-visible:ring-[var(--missing-color)]/35 focus-visible:shadow-[0_0_0_4px_rgba(220,76,100,0.16)]" : "k-border-ui focus-visible:border-[var(--gold-primary)] focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/25 focus-visible:shadow-[0_0_0_4px_rgba(201,168,76,0.14)]"}`
                        }, undefined, false, undefined, this),
                        /* @__PURE__ */ jsxDEV("p", {
                          id: "klaritex-text-count",
                          className: `font-mono-ui mt-2 shrink-0 text-sm leading-5 ${isNearLimit ? "text-[var(--tier2-color)]" : "text-[var(--text-secondary)]"}`,
                          children: [
                            textInput.length.toLocaleString(),
                            " / ",
                            MAX_TEXT_LENGTH.toLocaleString(),
                            isNearLimit && " (approaching limit)"
                          ]
                        }, undefined, true, undefined, this)
                      ]
                    }, undefined, true, undefined, this)
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this) : null,
              inputMode === "pdf" ? /* @__PURE__ */ jsxDEV(PdfUpload, {
                value: pdfFile,
                disabled: isAnalyzing,
                errorMessage,
                onFileChange: (file) => {
                  setPdfFile(file);
                  setErrorMessage(null);
                }
              }, undefined, false, undefined, this) : null,
              inputMode === "url" ? /* @__PURE__ */ jsxDEV(UrlInput, {
                value: urlInput,
                disabled: isAnalyzing,
                errorMessage,
                onChange: (value) => {
                  setUrlInput(value);
                  setErrorMessage(null);
                }
              }, undefined, false, undefined, this) : null
            ]
          }, undefined, true, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "mt-6",
            children: /* @__PURE__ */ jsxDEV(ModeToggle, {
              value: processingMode,
              onChange: setProcessingMode,
              disabled: isAnalyzing
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this),
          /* @__PURE__ */ jsxDEV("div", {
            className: "mt-6",
            children: /* @__PURE__ */ jsxDEV("button", {
              type: "button",
              onClick: handleAnalyze,
              disabled: !canAnalyze || analyzeButtonState === "complete",
              style: analyzeButtonAnimationStyle,
              className: `k-entrance-scale-in analyze-button font-ui relative inline-flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-lg px-5 py-0 font-semibold transition-transform duration-100 ease-out sm:h-auto sm:py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 ${isAnalyzePressed ? "scale-[0.97]" : "scale-100"} ${analyzeButtonState === "idle-active" ? "analyze-button--idle-active" : analyzeButtonState === "idle-disabled" ? "analyze-button--idle-disabled" : analyzeButtonState === "loading" ? "analyze-button--loading" : "analyze-button--complete"}`,
              children: analyzeButtonState === "loading" ? /* @__PURE__ */ jsxDEV(Fragment, {
                children: [
                  /* @__PURE__ */ jsxDEV("span", {
                    className: "analyze-button__spinner",
                    "aria-hidden": true
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("span", {
                    children: "Analyzing..."
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this) : analyzeButtonState === "complete" ? /* @__PURE__ */ jsxDEV(Fragment, {
                children: [
                  /* @__PURE__ */ jsxDEV("span", {
                    "aria-hidden": true,
                    children: "✓"
                  }, undefined, false, undefined, this),
                  /* @__PURE__ */ jsxDEV("span", {
                    children: "Done"
                  }, undefined, false, undefined, this)
                ]
              }, undefined, true, undefined, this) : "Analyze"
            }, undefined, false, undefined, this)
          }, undefined, false, undefined, this),
          analysisStateMessage && /* @__PURE__ */ jsxDEV("p", {
            className: "font-ui k-text-body mt-4 text-[var(--text-secondary)]",
            role: "status",
            "aria-live": "polite",
            children: analysisStateMessage
          }, undefined, false, undefined, this),
          lastResult && lastSource ? /* @__PURE__ */ jsxDEV("div", {
            className: "mt-4",
            children: /* @__PURE__ */ jsxDEV("button", {
              type: "button",
              onClick: handleDownloadPdf,
              disabled: isGeneratingPdf,
              className: "font-ui k-radius-primary inline-flex items-center gap-2 border border-[var(--gold-primary)]/70 bg-[var(--bg-secondary)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--gold-primary)] hover:bg-[var(--bg-elevated)] disabled:cursor-not-allowed disabled:opacity-60",
              children: [
                /* @__PURE__ */ jsxDEV("span", {
                  "aria-hidden": true,
                  children: /* @__PURE__ */ jsxDEV("svg", {
                    xmlns: "http://www.w3.org/2000/svg",
                    className: "k-icon-16",
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    children: [
                      /* @__PURE__ */ jsxDEV("path", {
                        d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("polyline", {
                        points: "7 10 12 15 17 10"
                      }, undefined, false, undefined, this),
                      /* @__PURE__ */ jsxDEV("line", {
                        x1: "12",
                        y1: "15",
                        x2: "12",
                        y2: "3"
                      }, undefined, false, undefined, this)
                    ]
                  }, undefined, true, undefined, this)
                }, undefined, false, undefined, this),
                isGeneratingPdf ? "Preparing PDF..." : "Download PDF Report"
              ]
            }, undefined, true, undefined, this)
          }, undefined, false, undefined, this) : null,
          inputMode === "text" ? /* @__PURE__ */ jsxDEV("p", {
            id: "klaritex-text-message",
            role: textHasError ? "alert" : "status",
            "aria-live": textHasError ? "assertive" : "polite",
            className: `font-ui mt-2 min-h-5 text-sm leading-5 ${textHasError ? "text-[var(--missing-color)]" : "text-transparent"}`,
            children: errorMessage ?? "Text looks good."
          }, undefined, false, undefined, this) : null
        ]
      }, undefined, true, undefined, this),
      /* @__PURE__ */ jsxDEV(ResultsPanel, {
        result: lastResult,
        isLoading: isAnalyzing
      }, undefined, false, undefined, this),
      /* @__PURE__ */ jsxDEV("style", {
        jsx: true,
        children: `
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
      `
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
export {
  InputPanel
};
