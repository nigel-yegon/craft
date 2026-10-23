// app/components/stagger.tsx
"use client";

import { Children, isValidElement } from "react";

export function Stagger({
  children,
  delayStart = 0,
  delayStep = 0.05,
  maxDelay = 0.4,
}: {
  children: React.ReactNode;
  delayStart?: number;
  delayStep?: number;
  maxDelay?: number;
}) {
  const items = Children.toArray(children);

  return (
    <>
      {items.map((child, i) => {
        if (!isValidElement(child)) return child;
        const delay = Math.min(delayStart + i * delayStep, maxDelay);
        return (
          <div
            key={(child.key as string) ?? i}
            style={{
              animation: `stagger-in 400ms ease-out ${delay}s both`,
            }}
          >
            {child}
          </div>
        );
      })}
    </>
  );
}