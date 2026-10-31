// lib/reveal.ts
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ------------------------------------------------------------------ */
/* Fade-to-reveal (used on pages that are NOT stacked cards)           */
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
/* Stacked cards — viewport-height sections that pin and stack         */
/* ------------------------------------------------------------------ */

export type StackedCardsOptions = {
  selector?: string;
  travel?: number;
  outgoingScale?: number;
  outgoingOpacity?: number;
  outgoingBlur?: number;
  incomingOpacity?: number;
  incomingScale?: number;
  start?: string;
};

const CARD_DEFAULTS: Required<StackedCardsOptions> = {
  selector: "[data-card]",
  travel: 100,
  outgoingScale: 0.92,
  outgoingOpacity: 0.55,
  outgoingBlur: 6,
  incomingOpacity: 0.65,
  incomingScale: 0.96,
  start: "top bottom",
};

export function buildStackedCards(
  container: HTMLElement | null,
  options: StackedCardsOptions = {}
): () => void {
  if (!container || typeof window === "undefined") return () => {};

  const opts = { ...CARD_DEFAULTS, ...options };
  const cards = gsap.utils.toArray<HTMLElement>(
    container.querySelectorAll<HTMLElement>(opts.selector)
  );

  if (cards.length < 2) return () => {};

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReduced) {
    gsap.set(cards, { clearProps: "all" });
    return () => {};
  }

  const mm = gsap.matchMedia();

  mm.add("(min-width: 0px)", () => {
    const ctx = gsap.context(() => {
      gsap.set(cards[0], { opacity: 1, scale: 1, filter: "blur(0px)" });

      cards.forEach((card, i) => {
        if (i === 0) return;
        const previous = cards[i - 1];

        gsap.fromTo(
          card,
          {
            yPercent: opts.travel,
            scale: opts.incomingScale,
            opacity: opts.incomingOpacity,
          },
          {
            yPercent: 0,
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              start: opts.start,
              end: "top top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          }
        );

        gsap.to(previous, {
          scale: opts.outgoingScale,
          opacity: opts.outgoingOpacity,
          filter: `blur(${opts.outgoingBlur}px)`,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: opts.start,
            end: "top top",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

        ScrollTrigger.create({
          trigger: previous,
          start: "top top",
          end: () => `+=${card.offsetHeight}`,
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      });

      const last = cards[cards.length - 1];
      ScrollTrigger.create({
        trigger: last,
        start: "top top",
        end: () => `+=${last.offsetHeight}`,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
    }, container);

    return () => ctx.revert();
  });

  return () => mm.revert();
}