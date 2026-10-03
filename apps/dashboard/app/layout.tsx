import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { Providers } from "@/components/providers";

import "./globals.css";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
      className={`${inter.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="relative flex w-full flex-col justify-center scroll-smooth bg-background font-sans antialiased [--header-height:calc(var(--spacing)*16)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
