import { FileTextIcon } from "blode-icons-react";
import Link from "next/link";

import { siteConfig } from "@/lib/config";
import { platformUrl } from "@/lib/marketing-site";

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
      className="footer-link"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {label}
    </a>
  ) : (
    <Link className="footer-link" href={href}>
      {label}
    </Link>
  );

const landingHref = (href: string) =>
  ({
    "/about": platformUrl("/about"),
    "/pricing": "#pricing",
    "/docs-as-code": "#how-it-works",
    "/compare/mintlify": "#faq",
  })[href] ?? href;
const retiredLandingPaths = new Set([
  "/blog",
  "/changelog",
  "/free-online-llms-txt-resources",
]);

export const SiteFooter = ({
  staticLanding = false,
}: {
  staticLanding?: boolean;
}) => (
  <footer className="border-border/60 border-t">
    <div className="mx-auto w-full max-w-[1436px] px-4 py-14 lg:px-[46px]">
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-5 lg:gap-0">
        <div className="col-span-2 hidden lg:col-span-1 lg:ml-8 lg:block">
          <a
            aria-label="Edda home"
            className="flex items-center text-foreground transition-opacity hover:opacity-70"
            href={siteConfig.links.marketing}
          >
            <FileTextIcon className="size-6" />
          </a>
        </div>

        {siteConfig.footerNav.map((group) => (
          <div className="lg:px-8" key={group.label}>
            <h3 className="mb-6 font-medium text-foreground text-xs leading-5 tracking-tight">
              {group.label}
            </h3>
            <ul className="flex flex-col">
              {group.links
                .filter(
                  (link) =>
                    !staticLanding || !retiredLandingPaths.has(link.href)
                )
                .map((link) => (
                  <li key={link.label}>
                    {renderLink(
                      staticLanding
                        ? { ...link, href: landingHref(link.href) }
                        : link
                    )}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>

      {/*
        blode.md is its own domain, not one of the zones proxied under
        blode.co, so both of these are genuine cross-origin links: new tab,
        and rel="noopener noreferrer".
      */}
      <div className="mt-14 flex flex-wrap items-center justify-center gap-2 border-border/60 border-t pt-8 text-muted-foreground text-xs leading-5 tracking-tight lg:px-8">
        <span>Crafted by</span>
        <a
          className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
          href="https://blode.co"
          rel={staticLanding ? "author" : "noopener noreferrer author"}
          target={staticLanding ? undefined : "_blank"}
        >
          {/* oxlint-disable-next-line no-img-element -- self-hosted 20px avatar, plain img avoids next/image overhead */}
          <img
            alt=""
            className="rounded-full"
            height={20}
            loading="lazy"
            src="/avatar-sm.png"
            width={20}
          />
          <span>Matthew Blode</span>
        </a>
      </div>
    </div>
  </footer>
);
