import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { RelativeTime } from "@/components/ui/relative-time";
import { marketingUrl, pageMetadata } from "@/lib/marketing-site";
import { breadcrumbNode, pageJsonLd, webPageNode } from "@/lib/structured-data";

const changelogDescription =
  "Every release, fix, and improvement to Blode.md. See what shipped across the CLI, renderer, hosting, and agent-readable exports.";
const changelogTitle = "Changelog and release notes";

export const metadata = pageMetadata({
  description: changelogDescription,
  path: "/changelog",
  title: changelogTitle,
});

const updates = [
  {
    date: "2026-04-24",
    items: [
      "Split marketing, docs, and dashboard deployments.",
      "Added tenant-aware llms.txt, sitemap, and robots outputs.",
      "Added GitHub app installation and deploy flows.",
    ],
    title: "Deployment split and agent-readable docs",
  },
];

const changelogJsonLd = pageJsonLd(
  webPageNode({
    description: changelogDescription,
    extra: {
      mainEntity: {
        "@type": "ItemList",
        itemListElement: updates.map((update, index) => ({
          "@type": "ListItem",
          name: update.title,
          position: index + 1,
          url: marketingUrl("/changelog"),
        })),
      },
    },
    name: changelogTitle,
    path: "/changelog",
  }),
  breadcrumbNode([
    { name: "Home", path: "/" },
    { name: "Changelog", path: "/changelog" },
  ])
);

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <JsonLd data={changelogJsonLd} />
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container">
          <Badge className="mb-4" variant="outline">
            Changelog
          </Badge>
          <h1 className="h-display max-w-3xl text-balance font-bold text-4xl md:text-6xl">
            Product updates
          </h1>
          <p className="measure mt-6 text-balance text-lg text-muted-foreground md:text-xl">
            Changes to the hosted platform, CLI, renderer, and docs runtime.
          </p>
        </div>
      </section>

      <section className="border-border border-t py-16 md:py-20">
        <div className="container">
          <div className="measure text-muted-foreground">
            <p>
              We log notable releases here when they affect how you ship or
              consume docs. Smaller fixes and dependency updates usually land
              quietly on GitHub. For narrative context on bigger decisions,
              check the{" "}
              <Link className="underline underline-offset-4" href="/blog">
                blog
              </Link>
              . To try what shipped, follow the{" "}
              <Link className="underline underline-offset-4" href="/docs">
                docs
              </Link>{" "}
              or sign in from the{" "}
              <Link className="underline underline-offset-4" href="/pricing">
                pricing
              </Link>{" "}
              page.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container">
          <ol className="measure flex flex-col divide-y divide-border">
            {updates.map((update) => (
              <li className="py-8 first:pt-0" key={update.title}>
                <RelativeTime
                  className="text-muted-foreground text-sm"
                  date={update.date}
                />
                <h2 className="mt-3 font-semibold text-2xl">{update.title}</h2>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-muted-foreground">
                  {update.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </MarketingShell>
  );
}
