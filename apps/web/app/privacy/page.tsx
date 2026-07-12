import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  description:
    "Privacy policy for Blode.md: what data we collect, how we use it, the third parties we rely on, and how to reach us about your information.",
  title: "Privacy | Blode.md",
};

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container">
          <Badge className="mb-4" variant="outline">
            Privacy
          </Badge>
          <h1 className="h-display max-w-3xl text-balance font-bold text-4xl md:text-6xl">
            Privacy policy
          </h1>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container">
          <div className="typeset measure text-muted-foreground">
            <h2>Scope</h2>
            <p>
              This policy covers Blode.md, the docs platform at blode.md, and
              the CLI that publishes to it.
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
