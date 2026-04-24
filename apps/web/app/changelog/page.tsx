import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { RelativeTime } from "@/components/ui/relative-time";

export const metadata: Metadata = {
  description: "Latest updates to the Blode.md platform.",
  title: "Changelog | Blode.md",
};

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

export default function ChangelogPage() {
  return (
    <MarketingShell>
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
