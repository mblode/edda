"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Registers the docs site's WebMCP tools with the browser once the page is
 * interactive, and unregisters them when the page goes away.
 *
 * Renders nothing. In a browser without WebMCP the effect finds no model
 * context and returns before loading the tools module, so visitors on other
 * browsers pay nothing for this.
 */
export const WebMcpTools = ({
  basePath,
  siteDescription,
  siteName,
}: {
  basePath: string;
  siteDescription?: string;
  siteName: string;
}) => {
  const router = useRouter();

  useEffect(() => {
    const doc = document as Document & { modelContext?: unknown };
    const nav = navigator as Navigator & { modelContext?: unknown };
    if (!(doc.modelContext || nav.modelContext)) {
      return;
    }

    const controller = new AbortController();
    const register = async () => {
      const { buildDocsWebMcpTools, registerWebMcpTools } =
        await import("@/lib/web-mcp-tools");
      if (controller.signal.aborted) {
        return;
      }
      const tools = buildDocsWebMcpTools({
        basePath,
        navigate: (href) => {
          router.push(href);
        },
        siteDescription,
        siteName,
      });
      await registerWebMcpTools(tools, { signal: controller.signal });
    };

    void (async () => {
      try {
        await register();
      } catch {
        // A failed registration leaves the page exactly as it was without WebMCP.
      }
    })();

    return () => {
      controller.abort();
    };
  }, [basePath, router, siteDescription, siteName]);

  return null;
};
