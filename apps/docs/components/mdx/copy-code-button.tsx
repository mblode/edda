"use client";

import { CheckIcon, ClipboardIcon } from "blode-icons-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export const CopyCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    if (!code) {
      return;
    }
    await navigator.clipboard.writeText(code);
    setCopied(true);
  }, [code]);

  return (
    <Button
      className="absolute top-3 right-2 z-10 size-7 bg-code hover:opacity-100 focus-visible:opacity-100"
      data-copied={copied}
      data-slot="copy-button"
      onClick={handleCopy}
      size="icon"
      type="button"
      variant="ghost"
    >
      <span className="sr-only">{copied ? "Copied" : "Copy"}</span>
      {copied ? (
        <CheckIcon aria-hidden="true" />
      ) : (
        <ClipboardIcon aria-hidden="true" />
      )}
    </Button>
  );
};
