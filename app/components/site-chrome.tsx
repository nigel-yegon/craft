"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";

export type SiteChromeSession = {
  name: string;
  email: string;
  role: string;
} | null;

export function SiteChrome({
  children,
  session,
}: {
  children: ReactNode;
  session: SiteChromeSession;
}) {
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/review");

  return (
    <>
      <Navbar session={session} />

      <main
        data-nav-offset
        className={`flex-1 ${isAdmin ? "" : "pt-0"}`}
      >
        {children}
      </main>

      {!isAdmin && <Footer />}
    </>
  );
}