"use client";

import { ThemeProvider } from "next-themes";

import { PostHogIdentity } from "./posthog-identity";

export const Providers = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider
    attribute="class"
    defaultTheme="system"
    disableTransitionOnChange
    enableColorScheme
    storageKey="theme"
  >
    <PostHogIdentity />
    {children}
  </ThemeProvider>
);
