import { GithubIcon } from "blode-icons-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/lib/config";

const renderLink = ({
  label,
  href,
  external,
}: {
  label: string;
  href: string;
  external?: boolean;
}) =>
  external ? (
    <a
      className="transition-colors hover:text-foreground"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
    </a>
  ) : (
    <Link className="transition-colors hover:text-foreground" href={href}>
      {label}
    </Link>
  );

export const SiteFooter = () => {
  const legalGroup = siteConfig.footerNav.find(
    (group) => group.label === "Legal"
  );
  const linkGroups = siteConfig.footerNav.filter(
    (group) => group.label !== "Legal"
  );
  const year = new Date().getFullYear();

  return (
    <footer className="border-border/60 border-t">
      <div className="container @container px-4 pt-24 pb-8 text-muted-foreground text-sm">
        <div className="grid grid-cols-1 gap-12 @md:grid-cols-[1.5fr_1fr_1fr_1fr] @md:gap-8">
          <div className="flex flex-col gap-5">
            <Link
              aria-label="Blode.md home"
              className="flex items-baseline gap-1 transition-opacity hover:opacity-70"
              href="/"
            >
              <span className="font-semibold text-foreground text-xl leading-none tracking-tight">
                Blode
              </span>
              <span className="font-mono text-foreground text-sm tracking-tight">
                .md
              </span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed">
              Docs your users love. And their AI understands. Ship Markdown
              from GitHub in minutes.
            </p>
            <a
              aria-label="GitHub"
              className="inline-flex size-8 items-center justify-center rounded-full border border-border/80 transition-colors hover:bg-muted hover:text-foreground"
              href={siteConfig.links.github}
              rel="noopener noreferrer"
              target="_blank"
            >
              <GithubIcon />
            </a>
          </div>
          {linkGroups.map((group) => (
            <div className="flex flex-col gap-3" key={group.label}>
              <h3 className="font-medium text-foreground text-xs uppercase tracking-[0.12em]">
                {group.label}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>{renderLink(link)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          aria-hidden
          className="h-display mt-20 select-none text-center font-semibold text-[22vw] text-foreground/[0.06] leading-[0.8] md:mt-28 md:text-[18rem]"
        >
          Blode.md
        </div>

        <div className="mt-8 flex flex-col gap-4 border-border/60 border-t pt-8 @md:flex-row @md:items-center @md:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span>© {year} Blode.md</span>
            <span className="hidden text-muted-foreground/60 @md:inline">
              ·
            </span>
            <a
              className="flex items-center gap-2 rounded-full py-1 transition-colors hover:text-foreground"
              href={siteConfig.links.author}
              rel="noopener noreferrer"
              target="_blank"
            >
              <Image
                alt="Avatar of Matthew Blode"
                className="rounded-full"
                height={20}
                src="/matthew-blode-profile.jpg"
                unoptimized
                width={20}
              />
              Crafted by Matthew Blode
            </a>
            <Badge className="font-mono" variant="outline">
              v{siteConfig.version}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {legalGroup?.links.map((link) => (
              <span key={link.label}>{renderLink(link)}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
