"use client";

import type { ContextualOption } from "@repo/models";
import {
  Checkmark1Icon,
  ChevronDownSmallIcon,
  ClaudeaiIcon,
  CodeAssistantIcon,
  CodeBracketsIcon,
  CodeIcon,
  CodeLinesIcon,
  CopySimpleIcon,
  GoogleColoredIcon,
  GrokIcon,
  MarkdownIcon,
  OpenaiIcon,
  PerplexityIcon,
  Plugin1Icon,
  SparkleIcon,
  WindIcon,
} from "blode-icons-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";

import {
  buildBuiltinUrl,
  builtinOptions,
  resolveCustomHref,
} from "@/lib/contextual-options";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

const iconMap: Record<string, IconComponent> = {
  ClaudeaiIcon,
  CodeAssistantIcon,
  CodeBracketsIcon,
  CodeIcon,
  CodeLinesIcon,
  CopySimpleIcon,
  GoogleColoredIcon,
  GrokIcon,
  MarkdownIcon,
  OpenaiIcon,
  PerplexityIcon,
  Plugin1Icon,
  SparkleIcon,
  WindIcon,
};

const getBuiltinIcon = (iconName: string): IconComponent =>
  iconMap[iconName] ?? CopySimpleIcon;

type ActionId = "copy" | "mcp" | "add-mcp" | "assistant";

interface ResolvedOption {
  key: string;
  title: string;
  description: string;
  icon: IconComponent;
  type: "action" | "link";
  action?: ActionId;
  href?: string;
}

interface ContextualContext {
  pageUrl: string;
  pageContent: string;
  pagePath: string;
  mcpServerUrl?: string;
}

const resolveOptions = (
  options: ContextualOption[],
  context: ContextualContext
): ResolvedOption[] => {
  const resolved: ResolvedOption[] = [];
  for (const option of options) {
    if (typeof option === "string") {
      const definition = builtinOptions[option];
      if (!definition) {
        continue;
      }
      if (definition.type === "action") {
        resolved.push({
          action: option as ActionId,
          description: definition.description,
          icon: getBuiltinIcon(definition.iconName),
          key: option,
          title: definition.title,
          type: "action",
        });
      } else {
        const href = buildBuiltinUrl(option, context);
        if (href) {
          resolved.push({
            description: definition.description,
            href,
            icon: getBuiltinIcon(definition.iconName),
            key: option,
            title: definition.title,
            type: "link",
          });
        }
      }
    } else {
      resolved.push({
        description: option.description,
        href: resolveCustomHref(option.href, context),
        icon: CopySimpleIcon,
        key: `custom-${option.title}`,
        title: option.title,
        type: "link",
      });
    }
  }
  return resolved;
};

const useContextualActions = (content: string, title: string) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleAction = useCallback(
    async (action: string, key?: string) => {
      const id = key ?? action;
      switch (action) {
        case "copy": {
          await navigator.clipboard.writeText(`# ${title}\n\n${content}`);
          setCopiedId(id);
          setTimeout(() => setCopiedId(null), 2000);
          break;
        }
        default: {
          break;
        }
      }
    },
    [content, title]
  );

  return { copiedId, handleAction };
};

const usePageContext = (
  content: string,
  title: string,
  pagePath: string
): ContextualContext => {
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  return {
    mcpServerUrl: undefined,
    pageContent: `# ${title}\n\n${content}`,
    pagePath,
    pageUrl,
  };
};

const MenuIcon = ({ children }: { children: ReactNode }) => (
  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border">
    {children}
  </div>
);

const MenuItem = ({
  children,
  href,
  onSelect,
}: {
  children: ReactNode;
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

interface ContextualMenuProps {
  options: ContextualOption[];
  content: string;
  title: string;
  pagePath: string;
}

export const ContextualMenu = ({
  options,
  content,
  title,
  pagePath,
}: ContextualMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const context = usePageContext(content, title, pagePath);
  const { copiedId, handleAction } = useContextualActions(content, title);
  const [menuOpen, setMenuOpen] = useState(false);

  const resolved = useMemo(
    () => resolveOptions(options, context),
    [context, options]
  );

  const [primaryOption] = resolved;

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

  const handlePrimaryAction = useCallback(async () => {
    if (!primaryOption) {
      return;
    }

    if (primaryOption.type === "link" && primaryOption.href) {
      window.open(primaryOption.href, "_blank", "noopener,noreferrer");
      return;
    }

    await handleAction(primaryOption.action ?? "", primaryOption.key);
  }, [handleAction, primaryOption]);

  const actionHandlers = useMemo(
    () =>
      Object.fromEntries(
        resolved
          .filter((item) => item.type === "action")
          .map((item) => [
            item.key,
            async () => {
              await handleAction(item.action ?? "", item.key);
              closeMenu();
            },
          ])
      ),
    [closeMenu, handleAction, resolved]
  );

  if (!primaryOption) {
    return null;
  }

  const isCopied = copiedId === primaryOption.key;

  return (
    <div className="relative flex shrink-0 items-center" ref={menuRef}>
      <button
        className="inline-flex items-center gap-2 rounded-l-xl border border-r-0 border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary/25"
        onClick={handlePrimaryAction}
        type="button"
      >
        {primaryOption.type === "action" && isCopied ? (
          <Checkmark1Icon aria-hidden="true" className="size-[18px]" />
        ) : (
          <primaryOption.icon aria-hidden="true" className="size-[18px]" />
        )}
        <span>
          {primaryOption.type === "action" && isCopied
            ? "Copied"
            : primaryOption.title}
        </span>
      </button>

      {resolved.length > 1 ? (
        <>
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
            <div className="absolute right-0 top-[calc(100%+0.25rem)] z-50 min-w-[320px] rounded-xl border border-border bg-background p-1 shadow-lg">
              {resolved.slice(1).map((item) => (
                <MenuItem
                  href={item.type === "link" ? item.href : undefined}
                  key={item.key}
                  onSelect={
                    item.type === "action"
                      ? actionHandlers[item.key]
                      : closeMenu
                  }
                >
                  <MenuIcon>
                    {item.type === "action" && copiedId === item.key ? (
                      <Checkmark1Icon
                        aria-hidden="true"
                        className="size-[18px]"
                      />
                    ) : (
                      <item.icon aria-hidden="true" className="size-[18px]" />
                    )}
                  </MenuIcon>
                  <div className="flex-1">
                    <div className="font-medium">
                      {item.title}
                      {item.type === "link" ? <ExternalArrow /> : null}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </MenuItem>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export const ContextualTocItems = ({
  content,
  options,
  title,
  pagePath,
}: ContextualMenuProps) => {
  const context = usePageContext(content, title, pagePath);
  const resolved = useMemo(
    () =>
      resolveOptions(options, context).filter(
        (item): item is ResolvedOption & { href: string; type: "link" } =>
          item.type === "link" && Boolean(item.href)
      ),
    [context, options]
  );

  if (!resolved.length) {
    return null;
  }

  return (
    <div className="grid gap-1.5">
      {resolved.map((item) => (
        <a
          className="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          href={item.href}
          key={item.key}
          rel="noopener noreferrer"
          target="_blank"
        >
          <item.icon aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="truncate">{item.title}</span>
        </a>
      ))}
    </div>
  );
};
