// app/store/[slug]/offering-detail-actions.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { OfferingRow } from "@/app/actions/store";

export function OfferingDetailActions({ offering }: { offering: OfferingRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    setAdded(true);
    startTransition(() => {
      // For Milestone 1, cart state lives only on /store. Routing back
      // lets the visitor add the offering from the grid. Milestone 2 will
      // lift cart state into a shared CartProvider so this becomes a real
      // "Add to cart" without leaving the page.
      router.push("/store");
    });
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={pending || added}
      className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
    >
      {added
        ? "Added — returning to catalogue…"
        : offering.pricingMode === "QUOTE"
          ? "Request a quote"
          : "Add to cart"}
    </button>
  );
}