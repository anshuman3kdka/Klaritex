// components/analyzer/ModeToggle.tsx
import { useEffect, useRef, useState } from "react";
import { jsxDEV } from "react/jsx-dev-runtime";
"use client";
var MODE_OPTIONS = [
  {
    value: "quick",
    label: "Quick",
    icon: /* @__PURE__ */ jsxDEV("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      className: "k-icon-16",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      children: /* @__PURE__ */ jsxDEV("path", {
        d: "M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      }, undefined, false, undefined, this)
    }, undefined, false, undefined, this),
    description: "Faster analysis. Good for a first pass."
  },
  {
    value: "deep",
    label: "Deep",
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
        /* @__PURE__ */ jsxDEV("circle", {
          cx: "11",
          cy: "11",
          r: "8"
        }, undefined, false, undefined, this),
        /* @__PURE__ */ jsxDEV("line", {
          x1: "21",
          y1: "21",
          x2: "16.65",
          y2: "16.65"
        }, undefined, false, undefined, this)
      ]
    }, undefined, true, undefined, this),
    description: "Thorough analysis. Recommended for serious evaluation."
  }
];
function ModeToggle({ value, onChange, disabled = false }) {
  const [touchFlashMode, setTouchFlashMode] = useState(null);
  const touchFlashTimeoutRef = useRef(null);
  const buttonRefs = useRef({});
  const handleKeyDown = (event) => {
    if (disabled)
      return;
    const currentIndex = MODE_OPTIONS.findIndex((option) => option.value === value);
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      const nextOption = MODE_OPTIONS[(currentIndex + 1) % MODE_OPTIONS.length];
      onChange(nextOption.value);
      window.setTimeout(() => {
        buttonRefs.current[nextOption.value]?.focus();
      }, 0);
      return;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      const nextOption = MODE_OPTIONS[(currentIndex - 1 + MODE_OPTIONS.length) % MODE_OPTIONS.length];
      onChange(nextOption.value);
      window.setTimeout(() => {
        buttonRefs.current[nextOption.value]?.focus();
      }, 0);
      return;
    }
  };
  const triggerTouchFlash = (mode) => {
    if (touchFlashTimeoutRef.current !== null) {
      window.clearTimeout(touchFlashTimeoutRef.current);
    }
    setTouchFlashMode(mode);
    touchFlashTimeoutRef.current = window.setTimeout(() => {
      setTouchFlashMode((current) => current === mode ? null : current);
      touchFlashTimeoutRef.current = null;
    }, 130);
  };
  useEffect(() => {
    return () => {
      if (touchFlashTimeoutRef.current !== null) {
        window.clearTimeout(touchFlashTimeoutRef.current);
      }
    };
  }, []);
  return /* @__PURE__ */ jsxDEV("div", {
    className: "space-y-3",
    children: [
      /* @__PURE__ */ jsxDEV("p", {
        id: "processing-mode-label",
        className: "font-ui k-text-heading",
        children: "Processing Mode"
      }, undefined, false, undefined, this),
      /* @__PURE__ */ jsxDEV("div", {
        className: "grid grid-cols-2 gap-2",
        role: "radiogroup",
        "aria-labelledby": "processing-mode-label",
        onKeyDown: handleKeyDown,
        children: MODE_OPTIONS.map((option) => {
          const isActive = option.value === value;
          const isTouchFlashing = touchFlashMode === option.value;
          return /* @__PURE__ */ jsxDEV("button", {
            ref: (el) => {
              buttonRefs.current[option.value] = el;
            },
            role: "radio",
            "aria-checked": isActive,
            tabIndex: isActive ? 0 : -1,
            type: "button",
            disabled,
            onTouchStart: () => {
              if (!disabled) {
                triggerTouchFlash(option.value);
              }
            },
            onClick: () => onChange(option.value),
            className: `k-radius-primary border p-3 text-left transition-transform duration-150 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold-primary)]/50 ${isTouchFlashing ? "bg-[var(--bg-elevated)]" : ""} ${isActive ? "border-[var(--gold-primary)] bg-[var(--bg-elevated)]" : "k-border-ui bg-[var(--bg-surface)]"} ${disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`,
            children: [
              /* @__PURE__ */ jsxDEV("p", {
                className: `font-ui k-text-heading flex items-center gap-2 ${isActive ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`,
                children: [
                  option.icon,
                  option.label
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsxDEV("p", {
                className: `font-ui mt-1 ${isActive ? "text-[var(--text-primary)]" : "k-text-helper"}`,
                children: option.description
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("span", {
                "aria-hidden": true,
                className: "mt-2 block h-px origin-left bg-[var(--gold-primary)] transition-[transform,opacity] duration-150",
                style: {
                  transform: isActive ? "scaleX(1)" : "scaleX(0)",
                  opacity: isActive ? 1 : 0
                }
              }, undefined, false, undefined, this)
            ]
          }, option.value, true, undefined, this);
        })
      }, undefined, false, undefined, this)
    ]
  }, undefined, true, undefined, this);
}
export {
  ModeToggle
};
