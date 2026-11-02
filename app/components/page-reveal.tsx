// app/components/page-reveal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSelectedLayoutSegments, useParams } from "next/navigation";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { revealPage, buildStackedCards } from "../../lib/reveal";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function PageReveal({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hydrated, setHydrated] = useState(false);

  // Flip after React's first hydration commit. Double RAF ensures
  // we're past the commit + paint, not just the commit.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setHydrated(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const segments = useSelectedLayoutSegments();
  const params = useParams();
  const routeKey = `${segments.join("/")}|${JSON.stringify(params)}`;

  useGSAP(
    () => {
      const el = containerRef.current;
      if (!el || !hydrated) return;  // ← gate: no GSAP until hydrated

      const hasCards = !!el.querySelector(".card-spacer");
      let cleanupCards: (() => void) | undefined;
      let cancelled = false;

      const build = () => {
        if (cancelled) return;
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
        cancelled = true;
        cleanupCards?.();
      };
    },
    { scope: containerRef, dependencies: [routeKey, hydrated] }  // ← re-run when hydrated flips
  );

  return (
    <div ref={containerRef} data-page-container>
      {children}
    </div>
  );
}