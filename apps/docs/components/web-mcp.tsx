"use client";

import { useEffect } from "react";

export const WebMcpTools = () => {
  useEffect(() => {
    const nav = navigator as Navigator & {
      modelContext?: { provideContext?: unknown };
    };
    if (!nav.modelContext?.provideContext) {
      return;
    }
    void (async () => {
      const { registerWebMcpTools } = await import("./web-mcp-tools");
      registerWebMcpTools();
    })();
  }, []);

  return null;
};
