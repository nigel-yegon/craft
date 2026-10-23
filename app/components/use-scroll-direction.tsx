// app/components/use-scroll-direction.tsx
"use client";

import { useEffect, useState } from "react";

export function useScrollDirection(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      if (Math.abs(y - last) < threshold) return;
      setScrolled(y > 0);
      last = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return { scrolled };
}