// app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "./components/footer";
import { Navbar } from "./components/navbar";
import { SessionProvider } from "next-auth/react";


const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500"],
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
      <body  suppressHydrationWarning className="flex min-h-screen flex-col font-sans antialiased">
        <SessionProvider> 
        <Suspense
          fallback={
            <div className="h-16 border-b border-deep-200 bg-cream-100 dark:border-deep-800 dark:bg-deep-950" />
          }
        >
          <Navbar session={null} />
        </Suspense>

        <div className="flex-1">{children}</div>
        <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}