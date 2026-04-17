"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { usePathname } from "next/navigation";

const PRIVATE_PATH_PREFIXES = ["/app", "/oauth"];

const isPrivatePath = (pathname: string | null) => {
  if (!pathname) {
    return false;
  }
  return PRIVATE_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
};

export const ThirdParties = () => {
  const pathname = usePathname();
  if (isPrivatePath(pathname)) {
    return null;
  }
  return (
    <>
      <SpeedInsights />
      <GoogleAnalytics gaId="G-WE1RCNSC4E" />
    </>
  );
};
