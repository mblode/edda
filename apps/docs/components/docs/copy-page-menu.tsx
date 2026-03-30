"use client";

import { slugify } from "@repo/common";
import {
  Checkmark1Icon,
  ChevronDownSmallIcon,
  ClaudeaiIcon,
  CopySimpleIcon,
  OpenaiIcon,
} from "blode-icons-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CopyPageMenuProps {
  content?: string;
  contentUrl?: string;
  title: string;
}

const LEADING_H1_REGEX = /^#\s+([^\r\n]+)(?:\r?\n(?:\r?\n)?)?/;

const stripMatchingLeadingH1 = (source: string, title: string) => {
  const trimmed = source.trimStart();
  const match = LEADING_H1_REGEX.exec(trimmed);
  if (!match) {
    return trimmed.trim();
  }

  const [headingLine = "", headingTitle = ""] = match;
  if (slugify(headingTitle) !== slugify(title)) {
    return trimmed.trim();
  }

  return trimmed.slice(headingLine.length).trim();
};

const formatMarkdownForCopy = (source: string, title: string) => {
  const content = stripMatchingLeadingH1(source, title);
  if (!content) {
    return `# ${title}`;
  }

  return `# ${title}\n\n${content}`;
};

const MenuItem = ({
  children,
  href,
  onSelect,
}: {
  children: React.ReactNode;
  href?: string;
  onSelect?: () => void;
}) =>
  href ? (
    <a
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-secondary/25"
      href={href}
      onClick={onSelect}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  ) : (
    <button
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-secondary/25"
      onClick={onSelect}
      type="button"
    >
      {children}
    </button>
  );

const MenuIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border">
    {children}
  </div>
);

const ExternalArrow = () => (
  <svg
    aria-hidden="true"
    className="ml-1 inline-block size-3"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
);

export const CopyPageMenu = ({
  content,
  contentUrl,
  title,
}: CopyPageMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pageUrl, setPageUrl] = useState("");
  const [resolvedContent, setResolvedContent] = useState(content ?? "");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    if (content !== undefined) {
      setResolvedContent(content);
    }
  }, [content]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) {
        return;
      }
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setMenuOpen((current) => !current);
  }, []);

  const getContent = useCallback(async () => {
    if (resolvedContent) {
      return resolvedContent;
    }

    if (!contentUrl) {
      return "";
    }

    const response = await fetch(contentUrl, {
      headers: {
        accept: "text/markdown,text/plain;q=0.9,*/*;q=0.8",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to load page markdown: ${response.status}`);
    }

    const nextContent = await response.text();
    setResolvedContent(nextContent);
    return nextContent;
  }, [contentUrl, resolvedContent]);

  const handleCopy = useCallback(async () => {
    const nextContent = await getContent();
    const markdown = formatMarkdownForCopy(nextContent, title);
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    closeMenu();
    setTimeout(() => setCopied(false), 2000);
  }, [closeMenu, getContent, title]);

  const chatgptUrl = pageUrl
    ? `https://chatgpt.com/?hints=search&q=${encodeURIComponent(`Read from ${pageUrl} so I can ask questions about it.`)}`
    : "#";
  const claudeUrl = pageUrl
    ? `https://claude.ai/new?q=${encodeURIComponent(`Read from ${pageUrl} so I can ask questions about it.`)}`
    : "#";

  return (
    <div className="relative flex shrink-0 items-center" ref={menuRef}>
      <button
        className="inline-flex items-center gap-2 rounded-l-xl border border-r-0 border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/25"
        onClick={handleCopy}
        type="button"
      >
        {copied ? (
          <Checkmark1Icon aria-hidden="true" className="size-[18px]" />
        ) : (
          <CopySimpleIcon aria-hidden="true" className="size-[18px]" />
        )}
        <span>{copied ? "Copied" : "Copy page"}</span>
      </button>

      <button
        aria-expanded={menuOpen}
        aria-label="More actions"
        className="inline-flex items-center self-stretch rounded-r-xl border border-border px-2 transition-colors hover:bg-secondary/25"
        onClick={toggleMenu}
        type="button"
      >
        <ChevronDownSmallIcon
          aria-hidden="true"
          className="size-[18px] text-muted-foreground"
        />
      </button>

      {menuOpen ? (
        <div className="absolute right-0 top-[calc(100%+0.25rem)] z-50 min-w-[280px] rounded-xl border border-border bg-background p-1 shadow-lg">
          <MenuItem onSelect={handleCopy}>
            <MenuIcon>
              <CopySimpleIcon aria-hidden="true" className="size-[18px]" />
            </MenuIcon>
            <div>
              <div className="font-medium">Copy page</div>
              <div className="text-xs text-muted-foreground">
                Copy page as Markdown for LLMs
              </div>
            </div>
          </MenuItem>

          <MenuItem href={chatgptUrl} onSelect={closeMenu}>
            <MenuIcon>
              <OpenaiIcon aria-hidden="true" className="size-[18px]" />
            </MenuIcon>
            <div className="flex-1">
              <div className="font-medium">
                Open in ChatGPT
                <ExternalArrow />
              </div>
              <div className="text-xs text-muted-foreground">
                Ask questions about this page
              </div>
            </div>
          </MenuItem>

          <MenuItem href={claudeUrl} onSelect={closeMenu}>
            <MenuIcon>
              <ClaudeaiIcon aria-hidden="true" className="size-[18px]" />
            </MenuIcon>
            <div className="flex-1">
              <div className="font-medium">
                Open in Claude
                <ExternalArrow />
              </div>
              <div className="text-xs text-muted-foreground">
                Ask questions about this page
              </div>
            </div>
          </MenuItem>
        </div>
      ) : null}
    </div>
  );
};
