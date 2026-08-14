import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/marketing-site";
import { breadcrumbNode, pageJsonLd, webPageNode } from "@/lib/structured-data";

const privacyDescription =
  "Privacy policy for Blode.md: what we collect when you sign in or publish docs, how we use it, third parties we rely on, and how to contact us.";
const privacyTitle = "Privacy policy and data practices";

export const metadata = pageMetadata({
  description: privacyDescription,
  path: "/privacy",
  title: privacyTitle,
});

const privacyJsonLd = pageJsonLd(
  webPageNode({
    description: privacyDescription,
    name: privacyTitle,
    path: "/privacy",
  }),
  breadcrumbNode([
    { name: "Home", path: "/" },
    { name: "Privacy", path: "/privacy" },
  ])
);

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <JsonLd data={privacyJsonLd} />
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container">
          <Badge className="mb-4" variant="outline">
            Privacy
          </Badge>
          <h1 className="h-display max-w-3xl text-balance font-bold text-4xl md:text-6xl">
            Privacy policy
          </h1>
          <p className="measure mt-6 text-balance text-lg text-muted-foreground md:text-xl">
            What we collect, what we do with it, and how to reach us if you have
            questions about your account or published content.
          </p>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container">
          <div className="typeset measure text-muted-foreground">
            <h2>Scope</h2>
            <p>
              This policy covers Blode.md, the docs platform at blode.md, and
              the CLI that publishes to it. It applies when you sign in with
              GitHub, connect a repository, or use the hosted service. For how
              we protect the platform itself, see our{" "}
              <Link className="underline underline-offset-4" href="/security">
                security page
              </Link>
              .
            </p>

            <h2>What we collect</h2>
            <ul>
              <li>Your GitHub profile when you sign in.</li>
              <li>The repos, folders, and domains you connect.</li>
              <li>Basic request logs so the service can run.</li>
            </ul>

            <h2>What we do not do</h2>
            <p>
              We do not sell your data. We do not run ad networks on docs you
              publish. We do not use your content to train models.
            </p>
            <p>
              Docs you publish are public by default on your chosen domain.
              Treat anything sensitive accordingly, and use your repo
              permissions the same way you would for application code.
            </p>

            <h2>Third parties</h2>
            <p>
              Sign-in and repository access go through GitHub. The hosted
              service runs on Vercel. Product analytics, when enabled, go to
              PostHog on our own proxy. We do not pass your docs to ad networks
              or model-training vendors.
            </p>

            <h2>Your data</h2>
            <p>
              You can delete your account and data at any time. Need help? Email{" "}
              <a
                className="underline underline-offset-4"
                href={`mailto:${siteConfig.links.email}`}
              >
                {siteConfig.links.email}
              </a>
              .
            </p>

            <h2>Contact</h2>
            <p>
              Questions about this policy? Email{" "}
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
