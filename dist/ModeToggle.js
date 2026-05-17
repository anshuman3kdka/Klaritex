// components/analyzer/ModeToggle.tsx
import { useEffect, useRef, useState } from "react";
import { LabLabel } from "../lab";
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
  const optionRefs = useRef({
    quick: null,
    deep: null
  });
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
  function handleKeyDown(event) {
    if (disabled)
      return;
    const currentIndex = MODE_OPTIONS.findIndex((opt) => opt.value === value);
    let nextIndex = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % MODE_OPTIONS.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + MODE_OPTIONS.length) % MODE_OPTIONS.length;
    }
    if (nextIndex !== -1) {
      const nextValue = MODE_OPTIONS[nextIndex].value;
      onChange(nextValue);
      setTimeout(() => {
        optionRefs.current[nextValue]?.focus();
      }, 0);
    }
  }
  return /* @__PURE__ */ jsxDEV("div", {
    className: "space-y-3",
    children: [
      /* @__PURE__ */ jsxDEV(LabLabel, {
        id: "processing-mode-label",
        children: "Processing Mode"
      }, undefined, false, undefined, this),
      /* @__PURE__ */ jsxDEV("div", {
        className: "grid grid-cols-2 gap-4",
        role: "radiogroup",
        "aria-labelledby": "processing-mode-label",
        onKeyDown: handleKeyDown,
        children: MODE_OPTIONS.map((option) => {
          const isActive = option.value === value;
          return /* @__PURE__ */ jsxDEV("button", {
            ref: (el) => {
              optionRefs.current[option.value] = el;
            },
            role: "radio",
            "aria-checked": isActive,
            tabIndex: disabled ? -1 : isActive ? 0 : -1,
            type: "button",
            disabled,
            onClick: () => onChange(option.value),
            className: `p-4 text-left transition-[box-shadow,background-color] duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lab-gold)]/50 rounded-2xl ${isActive ? "shadow-[var(--shadow-pressed)] bg-[var(--lab-surface)] text-[var(--lab-ink)]" : "shadow-[var(--shadow-extruded)] bg-[var(--lab-surface)] text-[var(--lab-muted)] hover:text-[var(--lab-ink)] hover:shadow-[var(--shadow-pressed)]"} ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`,
            children: [
              /* @__PURE__ */ jsxDEV("p", {
                className: "font-sans font-semibold text-sm flex items-center gap-2",
                children: [
                  option.icon,
                  option.label
                ]
              }, undefined, true, undefined, this),
              /* @__PURE__ */ jsxDEV("p", {
                className: "font-sans text-xs mt-2 opacity-80",
                children: option.description
              }, undefined, false, undefined, this),
              /* @__PURE__ */ jsxDEV("span", {
                "aria-hidden": true,
                className: "mt-3 block h-px origin-left bg-[var(--lab-gold)] transition-transform duration-200",
                style: {
                  transform: isActive ? "scaleX(1)" : "scaleX(0)"
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
