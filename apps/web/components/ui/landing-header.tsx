import { FileTextIcon } from "blode-icons-react";

import { siteConfig } from "@/lib/config";

const links = [
  { href: "/docs", label: "Docs" },
  { href: "#pricing", label: "Pricing" },
  { href: "#about", label: "About" },
  { href: siteConfig.links.github, label: "GitHub" },
];

/** /edda serves HTML without React hydration. Keep every control native. */
export const LandingHeader = () => (
  <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-4">
    <div className="relative flex w-full max-w-[1200px] items-center justify-between rounded-full border border-border/60 bg-background/95 py-2 pr-2 pl-5">
      <a
        className="flex items-center gap-1.5 font-semibold"
        href={siteConfig.links.marketing}
        aria-label="Edda home"
      >
        <FileTextIcon className="size-4" />
        Edda
      </a>
      <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
        {links.map((link) => (
          <a
            className="rounded-full px-3 py-2 text-sm hover:bg-muted"
            key={link.href}
            href={link.href}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <a
          className="hidden px-3 py-2 text-sm sm:inline-flex"
          href="https://blode.md/oauth/consent"
        >
          Log in
        </a>
        <a
          className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
          href="https://blode.md/oauth/consent"
        >
          Sign up
        </a>
        <details className="md:hidden">
          <summary className="cursor-pointer rounded-full px-3 py-2 text-sm">
            Menu
          </summary>
          <nav
            aria-label="Mobile"
            className="absolute inset-x-0 top-full mt-2 flex flex-col rounded-2xl border border-border bg-background p-4 shadow-lg"
          >
            {links.map((link) => (
              <a
                className="rounded-lg p-3 hover:bg-muted"
                key={link.href}
                href={link.href}
              >
                {link.label}
              </a>
            ))}
            <a
              className="rounded-lg p-3 hover:bg-muted"
              href="https://blode.md/oauth/consent"
            >
              Log in
            </a>
          </nav>
        </details>
      </div>
    </div>
  </header>
);
