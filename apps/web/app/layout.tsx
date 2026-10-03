import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter } from "next/font/google";

import { Providers } from "@/components/providers";
import { WebMcpTools } from "@/components/web-mcp";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  SITE_NAME,
  TITLE_TEMPLATE,
} from "@/lib/marketing-site";

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
  authors: [{ name: "Matthew Blode", url: "https://blode.co" }],
  creator: "Matthew Blode",
  description: HOME_DESCRIPTION,
  metadataBase: new URL("https://blode.md"),
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
  other: {
    "apple-mobile-web-app-title": SITE_NAME,
  },
  publisher: "Matthew Blode",
  robots: {
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  title: {
    default: HOME_TITLE,
    template: TITLE_TEMPLATE,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@mattblode",
  },
  verification: {
    google: "mFwyBIbXTaKK4uF_NA0MzVWFyY40hPgBjFObg3rje04",
  },
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
      className={`${inter.variable} ${geistMono.variable}`}
      // globals.css sets smooth scrolling on <html>; this lets Next turn it off
      // during route transitions so a client navigation lands at the top.
      data-scroll-behavior="smooth"
      lang="en"
      suppressHydrationWarning
    >
      <body className="relative flex w-full flex-col justify-center scroll-smooth bg-background font-sans antialiased [--header-height:calc(var(--spacing)*16)]">
        <Providers>
          <WebMcpTools />
          {children}
        </Providers>
      </body>
    </html>
  );
}
