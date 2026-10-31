// app/components/page-reveal.tsx
"use client";

import { useRef } from "react";
import { useSelectedLayoutSegments } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealPage, buildStackedCards } from "@/lib/reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function PageReveal({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // `useSelectedLayoutSegments` is safe during prerender (unlike
  // `usePathname`), and gives us a stable string key we can use to
  // re-run the GSAP effect whenever the route changes.
  const segments = useSelectedLayoutSegments();
  const routeKey = segments.join("/");

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el) return;

      // Auto-wrap top-level <section> children into stacked cards if
      // the page hasn't explicitly opted in via [data-card]. Pages
      // that do opt in (like the homepage) are left untouched.
      let promoted = false;
      if (!el.querySelector("[data-card]")) {
        const sections = Array.from(el.children).filter(
          (n): n is HTMLElement =>
            n instanceof HTMLElement && n.tagName === "SECTION"
        );
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

      // Wait for fonts + layout to settle so ScrollTrigger measures
      // pin distances against the final layout, not the pre-font one.
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
        // Undo promoted attributes so we don't leak state across routes.
        if (promoted) {
          el.querySelectorAll<HTMLElement>("[data-card]").forEach((n) => {
            n.removeAttribute("data-card");
            n.classList.remove("stack-card");
          });
        }
        // ScrollTrigger leaves global state behind; nuke it on teardown.
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    { scope: containerRef, dependencies: [routeKey] }
  );

  return (
    <div ref={containerRef} data-page-container>
      {children}
    </div>
  );
}