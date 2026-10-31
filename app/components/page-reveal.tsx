// app/components/page-reveal.tsx
"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealPage, buildStackedCards } from "../../lib/reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function PageReveal({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      // Auto-wrap: if there are no [data-card] elements yet, promote
      // each direct <section> child to a card. Pages that already opt
      // in via data-card are left alone.
      let promoted = false;
      if (!el.querySelector("[data-card]")) {
        const sections = Array.from(el.children).filter(
          (n): n is HTMLElement =>
            n instanceof HTMLElement && n.tagName === "SECTION"
        );
        // Only stack if there are at least 2 sections — otherwise it's a
        // single-screen page and stacking is meaningless.
        if (sections.length >= 2) {
          sections.forEach((s) => {
            s.setAttribute("data-card", "");
            s.classList.add("stack-card");
          });
          promoted = true;
        }
      }

      const hasCards = !!el.querySelector("[data-card]");
      let cleanupCards: (() => void) | undefined;

      // Defer building until layout + fonts settle — otherwise pin
      // distances are computed against a pre-font layout and jump.
      const build = () => {
        if (hasCards) {
          cleanupCards = buildStackedCards(el);
        } else {
          revealPage(el);
        }
        ScrollTrigger.refresh();
      };

      if (document.fonts?.ready) {
        document.fonts.ready.then(build);
      } else {
        requestAnimationFrame(build);
      }

      return () => {
        cleanupCards?.();
        // Undo the promoted attributes so we don't leak state between routes.
        if (promoted) {
          el.querySelectorAll<HTMLElement>("[data-card]").forEach((n) => {
            n.removeAttribute("data-card");
            n.classList.remove("stack-card");
          });
        }
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: containerRef, dependencies: [pathname] }
  );

  return (
    <div ref={containerRef} data-page-container>
      {children}
    </div>
  );
}