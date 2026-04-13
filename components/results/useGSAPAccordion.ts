"use client";

import { gsap } from "gsap";
import { RefObject, useEffect, useRef } from "react";

export function useGSAPAccordion(isOpen: boolean, contentRef: RefObject<HTMLDivElement>) {
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      gsap.set(content, {
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
      });
      return;
    }

    gsap.killTweensOf(content);

    if (isOpen) {
      gsap.fromTo(
        content,
        { height: 0, opacity: 0, overflow: "hidden" },
        {
          height: "auto",
          opacity: 1,
          duration: 0.18,
          ease: "power2.out",
          onComplete: () => {
            const moduleId = content.dataset.moduleId ?? "";
            content.dispatchEvent(
              new CustomEvent("moduleRevealed", {
                bubbles: true,
                detail: { moduleId },
              })
            );
          },
        }
      );
      return;
    }

    gsap.to(content, {
      height: 0,
      opacity: 0,
      duration: 0.12,
      ease: "power2.in",
      overflow: "hidden",
    });
  }, [isOpen, contentRef]);
}

