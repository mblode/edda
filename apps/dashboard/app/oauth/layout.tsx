import type { Metadata } from "next";
import type { ReactNode } from "react";

// Auth screens have no standalone content value and were being crawled and
// indexed via the blode.md/oauth proxy. Keep the whole segment out of search.
export const metadata: Metadata = {
  robots: { follow: false, index: false },
};

export default function OAuthLayout({ children }: { children: ReactNode }) {
  return children;
}
