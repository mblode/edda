import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/marketing-site";
import { breadcrumbNode, pageJsonLd, webPageNode } from "@/lib/structured-data";

const termsDescription =
  "Terms of service for Blode.md: ground rules for the hosted docs platform, including your content, acceptable use, account responsibilities, and updates.";
const termsTitle = "Terms of service for Blode.md";

export const metadata = pageMetadata({
  description: termsDescription,
  path: "/terms",
  title: termsTitle,
});

const termsJsonLd = pageJsonLd(
  webPageNode({
    description: termsDescription,
    name: termsTitle,
    path: "/terms",
  }),
  breadcrumbNode([
    { name: "Home", path: "/" },
    { name: "Terms", path: "/terms" },
  ])
);

export default function TermsPage() {
  return (
    <MarketingShell>
      <JsonLd data={termsJsonLd} />
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container">
          <Badge className="mb-4" variant="outline">
            Terms
          </Badge>
          <h1 className="h-display max-w-3xl text-balance font-bold text-4xl md:text-6xl">
            Terms of service
          </h1>
          <p className="measure mt-6 text-balance text-lg text-muted-foreground md:text-xl">
            The ground rules for using the hosted Blode.md service, publishing
            content, and keeping accounts in good standing.
          </p>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container">
          <div className="typeset measure text-muted-foreground">
            <h2>Agreement</h2>
            <p>
              By using Blode.md, you agree to these terms. They apply to the
              hosted service at blode.md and to accounts you create through
              GitHub sign-in. For how we handle personal data, see our{" "}
              <Link className="underline underline-offset-4" href="/privacy">
                privacy policy
              </Link>
              .
            </p>

            <h2>Your content</h2>
            <p>
              You own the content you publish. You grant us the license we need
              to host, build, and serve it. That license ends when you remove
              the content.
            </p>

            <h2>Acceptable use</h2>
            <p>
              Do not use Blode.md for content that is illegal, abusive, or that
              violates someone else&apos;s rights. Do not use it to attack or
              scrape other services.
            </p>
            <p>
              You are responsible for what you publish and for keeping connected
              repositories and domains under your control. If you need help
              configuring a site, the{" "}
              <Link className="underline underline-offset-4" href="/docs">
                docs
              </Link>{" "}
              are the best place to start.
            </p>

            <h2>Termination</h2>
            <p>
              You can stop using the service at any time. We can suspend
              accounts that break these terms.
            </p>

            <h2>No warranty</h2>
            <p>
              The service is provided as is. We do our best to keep it reliable,
              but cannot guarantee zero downtime.
            </p>

            <h2>Changes</h2>
            <p>
              If we update these terms, the latest version will live at this
              URL.
            </p>

            <h2>Contact</h2>
            <p>
              Questions? Email{" "}
              <a
                className="underline underline-offset-4"
                href={`mailto:${siteConfig.links.email}`}
              >
                {siteConfig.links.email}
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
