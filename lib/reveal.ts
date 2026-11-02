// lib/reveal.ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------ */
/* Fade-to-reveal — for pages WITHOUT stacked cards                    */
/* ------------------------------------------------------------------ */

export type RevealOptions = {
  selector?: string;
  stagger?: number;
  duration?: number;
  yOffset?: number;
  ease?: string;
  delay?: number;
};

const DEFAULTS: Required<RevealOptions> = {
  selector: "[data-reveal]",
  stagger: 0.08,
  duration: 0.65,
  yOffset: 22,
  ease: "power3.out",
  delay: 0.05,
};

export function revealPage(
  container: HTMLElement | null,
  options: RevealOptions = {}
): gsap.core.Timeline | null {
  if (!container) return null;

  const opts = { ...DEFAULTS, ...options };
  const targets = gsap.utils.toArray<HTMLElement>(
    container.querySelectorAll(opts.selector)
  );

  if (!targets.length) return null;

  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    gsap.set(targets, { autoAlpha: 1, y: 0, clearProps: "transform" });
    return null;
  }

  gsap.killTweensOf(targets);
  gsap.set(targets, { autoAlpha: 0, y: opts.yOffset });

  return gsap.timeline({ delay: opts.delay }).to(targets, {
    autoAlpha: 1,
    y: 0,
    duration: opts.duration,
    stagger: opts.stagger,
    ease: opts.ease,
    clearProps: "opacity,visibility,transform",
  });
}

/* ------------------------------------------------------------------ */
/* Stacked cards — CSS sticky handles layout, GSAP scrubs the fade     */
/* ------------------------------------------------------------------ */

export type StackedCardsOptions = {
  spacerSelector?: string;
  selector?: string;
  outgoingScale?: number;
  outgoingOpacity?: number;
  outgoingBlur?: number;
  incomingOpacity?: number;
  incomingScale?: number;
};

const CARD_DEFAULTS: Required<StackedCardsOptions> = {
  spacerSelector: ".card-spacer",
  selector: "[data-card]",
  outgoingScale: 0.92,
  outgoingOpacity: 0.5,
  outgoingBlur: 8,
  incomingOpacity: 0.6,
  incomingScale: 0.97,
};

export function buildStackedCards(
  container: HTMLElement | null,
  options: StackedCardsOptions = {}
): () => void {
  if (!container || typeof window === "undefined") return () => {};

  const opts = { ...CARD_DEFAULTS, ...options };

  const spacers = gsap.utils.toArray<HTMLElement>(
    container.querySelectorAll<HTMLElement>(opts.spacerSelector)
  );

  const cards: HTMLElement[] = [];
  for (const spacer of spacers) {
    const card = spacer.querySelector<HTMLElement>(opts.selector);
    if (card) cards.push(card);
  }

  if (cards.length < 2) return () => {};

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReduced) {
    gsap.set(cards, { clearProps: "all" });
    return () => {};
  }

  const ctx = gsap.context(() => {
    // Baseline: first card at full opacity, no scale, no blur.
    gsap.set(cards[0], { opacity: 1, scale: 1, filter: "blur(0px)" });

    cards.forEach((card, i) => {
      if (i === 0) return;
      const previous = cards[i - 1];

      // Incoming card: fade + scale in as it slides over the previous
      // one via CSS sticky's natural geometry.
      gsap.fromTo(
        card,
        { scale: opts.incomingScale, opacity: opts.incomingOpacity },
        {
          scale: 1,
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // Outgoing card: recede (dim, shrink, blur) as the incoming
      // card sweeps over it.
      gsap.to(previous, {
        scale: opts.outgoingScale,
        opacity: opts.outgoingOpacity,
        filter: `blur(${opts.outgoingBlur}px)`,
        ease: "none",
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "top top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    });
  }, container);

  return () => ctx.revert();
}
