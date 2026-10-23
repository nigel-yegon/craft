// app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "./components/footer";
import { Navbar } from "./components/navbar";
import localFont from "next/font/local";

const spaceGrotesk = localFont({
  src: [
    { path: "./fonts/SpaceGrotesk-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/SpaceGrotesk-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/SpaceGrotesk-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/SpaceGrotesk-Bold.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-sans",
});

const jetbrainsMono = localFont({
  src: [
    { path: "./fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  display: "swap",
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Craft Studios — Ideas, Integrated.",
    template: "%s · Craft Studios",
  },
  description:
    "A fully integrated creative, design and technology studio. Spaces. Systems. Experiences.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <Suspense
          fallback={
            <div className="h-16 border-b border-deep-200 bg-cream-100 dark:border-deep-800 dark:bg-deep-950" />
          }
        >
          <Navbar session={null} />
        </Suspense>

        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}