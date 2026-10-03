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
  description: "Knowledge docs for agents. Git-native MDX. Publish on merge.",
  metadataBase: new URL("https://blode.md"),
  openGraph: {
    siteName: "Edda",
    type: "website",
  },
  other: {
    "apple-mobile-web-app-title": "Edda",
  },
  robots: {
    googleBot: {
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  title: "Edda | Knowledge docs for agents",
  twitter: {
    card: "summary_large_image",
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
      lang="en"
      className={`${inter.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://public.blob.vercel-storage.com" />
      </head>
      <body className="relative flex w-full flex-col justify-center scroll-smooth bg-background font-sans antialiased [--header-height:calc(var(--spacing)*16)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
