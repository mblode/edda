import Link from "next/link";
import type { ReactNode } from "react";

interface TileProps {
  href: string;
  title?: string;
  description?: string;
  children: ReactNode;
}

export const Tile = ({ href, title, description, children }: TileProps) => {
  const isExternal = href.startsWith("http");

  const inner = (
    <div className="group/tile overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30 hover:bg-accent/50">
      <div className="flex items-center justify-center bg-muted/50 p-6">
        {children}
      </div>
      {title || description ? (
        <div className="border-t border-border p-3">
          {title ? (
            <div className="text-sm font-medium text-foreground">{title}</div>
          ) : null}
          {description ? (
            <div className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  // Same underline leak as Card: typeset underlines content anchors and the
  // decoration propagates into the tile's title and description.
  const linkClassName =
    "block rounded-xl no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

  if (isExternal) {
    return (
      <a
        className={linkClassName}
        data-typeset-block=""
        href={href}
        rel="noopener noreferrer"
        target="_blank"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link className={linkClassName} data-typeset-block="" href={href}>
      {inner}
    </Link>
  );
};
