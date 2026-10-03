import { DevReloadScript } from "@dev/components/dev-reload-script";
import { Providers } from "@dev/components/providers";
import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const inter = localFont({
  display: "swap",
  src: [
    { path: "./fonts/inter-variable.woff2", style: "normal" },
    { path: "./fonts/inter-variable-italic.woff2", style: "italic" },
  ],
  variable: "--font-inter",
  weight: "100 900",
});

const geistMono = localFont({
  display: "swap",
  src: [{ path: "./fonts/geist-mono.woff2" }],
  variable: "--font-geist-mono",
  weight: "400",
});

export const metadata: Metadata = {
  description: "Local docs preview for edda dev.",
  title: "edda dev",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="relative flex w-full flex-col justify-center overflow-x-hidden scroll-smooth bg-background font-sans antialiased [--header-height:calc(var(--spacing)*16)]">
        <DevReloadScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
