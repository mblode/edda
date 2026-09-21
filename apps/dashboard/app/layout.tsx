import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { Providers } from "@/components/providers";

import "./globals.css";

const glide = localFont({
  display: "swap",
  src: [
    { path: "./fonts/glide-variable.woff2", style: "normal" },
    { path: "./fonts/glide-variable-italic.woff2", style: "italic" },
  ],
  variable: "--font-glide",
  weight: "100 950",
});

const glideMono = localFont({
  display: "swap",
  src: [{ path: "./fonts/glide-mono.woff2" }],
  variable: "--font-glide-mono",
  weight: "400",
});

export const metadata: Metadata = {
  description: "Edda dashboard and authentication.",
  other: {
    "apple-mobile-web-app-title": "Edda",
  },
  title: "Edda",
};

export const viewport: Viewport = {
  initialScale: 1,
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${glide.variable} ${glideMono.variable}`}
      suppressHydrationWarning
    >
      <body className="relative flex w-full flex-col justify-center scroll-smooth bg-background font-sans antialiased [--header-height:calc(var(--spacing)*16)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
