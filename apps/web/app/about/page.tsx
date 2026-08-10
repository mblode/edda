import { ArrowRightIcon } from "blode-icons-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/marketing-site";

export const metadata = pageMetadata({
  description:
    "About Blode.md, the docs platform in your git repo. Write MDX locally, push to main, and ship documentation as fast as you ship code.",
  path: "/about",
  title: "About the Blode.md docs platform",
});

export default function AboutPage() {
  return (
    <MarketingShell>
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container">
          <Badge className="mb-4" variant="outline">
            About
          </Badge>
          <h1 className="h-display max-w-3xl text-balance font-bold text-4xl md:text-6xl">
            Your docs are your AI interface.
          </h1>
          <p className="measure mt-6 text-balance text-lg text-muted-foreground md:text-xl">
            Docs used to be pages people scanned. They still are. They are also
            how every AI agent learns your product. Blode.md keeps that
            interface where it belongs, next to the code. How agents find that
            content on the open web is covered in our{" "}
            <Link
              className="underline underline-offset-4"
              href="/free-online-llms-txt-resources"
            >
              free online llms.txt resources
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-border border-t py-24 md:py-32">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div className="min-w-0">
              <Badge className="mb-4" variant="outline">
                Why
              </Badge>
              <h2 className="h-display text-balance font-bold text-3xl md:text-4xl">
                The knowledge layer belongs with the code
              </h2>
            </div>
            <div className="measure flex flex-col gap-6 text-muted-foreground">
              <p>
                Docs in a separate CMS drift. Agents reading drifted docs give
                the wrong answer. The pull request is the review. The merge is
                the deploy. Docs should use the same path.
              </p>
              <p>
                Blode.md keeps the surface small. No plugin marketplace, no deep
                config. If a feature widens the gap between code and docs, it
                does not ship.
              </p>
              <p>
                The CLI scaffolds a project, the renderer ships MDX, and the
                hosted service deploys on every push. Custom domains, search,
                and an API reference are included from day one. See{" "}
                <Link className="underline underline-offset-4" href="/pricing">
                  pricing
                </Link>{" "}
                for hosted and self-hosted options, or read the{" "}
                <Link className="underline underline-offset-4" href="/docs">
                  docs
                </Link>{" "}
                to get started.
              </p>
              <p>
                The longer version of that argument is in{" "}
                <Link
                  className="underline underline-offset-4"
                  href="/blog/intro-to-blode-md"
                >
                  Hello, Blode.md
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-border border-t py-24 md:py-32">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h3 className="h-display font-bold text-xl">Who built it</h3>
              <p className="mt-3 text-muted-foreground">
                Blode.md is built by{" "}
                <a
                  className="underline underline-offset-4"
                  href={siteConfig.links.author}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Matthew Blode
                </a>
                .
              </p>
            </div>
            <div>
              <h3 className="h-display font-bold text-xl">Open source</h3>
              <p className="mt-3 text-muted-foreground">
                The source, issues, and releases live on{" "}
                <a
                  className="underline underline-offset-4"
                  href={siteConfig.links.github}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  GitHub
                </a>
                .
              </p>
            </div>
            <div>
              <h3 className="h-display font-bold text-xl">Get in touch</h3>
              <p className="mt-3 text-muted-foreground">
                Email{" "}
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
          <div className="mt-12">
            <Button asChild size="lg">
              <Link href="/">
                Back to home
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
