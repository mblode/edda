import { FileTextIcon } from "blode-icons-react";
import Link from "next/link";

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

export const SiteFooter = () => (
  <footer className="border-border/60 border-t">
    <div className="mx-auto w-full max-w-[1436px] px-4 py-14 lg:px-[46px]">
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-5 lg:gap-0">
        <div className="col-span-2 hidden lg:col-span-1 lg:ml-8 lg:block">
          <Link
            aria-label="Blode.md home"
            className="flex items-center text-foreground transition-opacity hover:opacity-70"
            href="/"
          >
            <FileTextIcon className="size-6" />
          </Link>
        </div>

        {siteConfig.footerNav.map((group) => (
          <div className="lg:px-8" key={group.label}>
            <h3 className="mb-6 font-medium text-foreground text-xs leading-5 tracking-tight">
              {group.label}
            </h3>
            <ul className="flex flex-col">
              {group.links.map((link) => (
                <li key={link.label}>{renderLink(link)}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-14 border-border/60 border-t pt-8 lg:px-8">
        <a
          className="inline-flex items-center gap-2 text-muted-foreground text-xs leading-5 tracking-tight transition-colors hover:text-foreground"
          href="https://matthewblode.com"
          rel="author noopener noreferrer"
          target="_blank"
        >
          <span>Crafted by</span>
          {/* oxlint-disable-next-line no-img-element -- external avatar, intentionally not next/image */}
          <img
            alt="Matthew Blode"
            className="rounded-full"
            height={20}
            loading="lazy"
            src="https://matthewblode.com/avatar-sm.png"
            width={20}
          />
          <span>Matthew Blode</span>
        </a>
      </div>
    </div>
  </footer>
);
