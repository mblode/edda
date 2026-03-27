import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

const glide = localFont({
  display: "swap",
  src: [{ path: "../public/glide-variable.woff2" }],
  variable: "--font-glide",
  weight: "400 900",
});

export const metadata: Metadata = {
  description: "Tenant-aware documentation rendering service",
  title: "Atlas Docs Runtime",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={glide.variable} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
