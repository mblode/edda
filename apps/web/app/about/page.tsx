import { ArrowRightIcon } from "blode-icons-react";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { siteConfig } from "@/lib/config";
import { pageMetadata } from "@/lib/marketing-site";
import {
  breadcrumbNode,
  pageJsonLd,
  PERSON_ID,
  webPageNode,
} from "@/lib/structured-data";

const aboutDescription =
  "Matthew Blode built Blode.md to keep docs in git. No second editor, no marketplace. Hosted is $0. MIT if you run it yourself.";
const aboutTitle = "About the Blode.md docs platform";

export const metadata = pageMetadata({
  description: aboutDescription,
  path: "/about",
  title: aboutTitle,
});

const aboutJsonLd = pageJsonLd(
  webPageNode({
    description: aboutDescription,
    extra: {
      about: { "@id": PERSON_ID },
      mainEntity: { "@id": PERSON_ID },
    },
    name: aboutTitle,
    path: "/about",
    type: "ProfilePage",
  }),
  breadcrumbNode([
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ])
);

export default function AboutPage() {
  return (
    <MarketingShell>
      <JsonLd data={aboutJsonLd} />
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container">
          <Badge className="mb-4" variant="outline">
            About
          </Badge>
          <h1 className="h-display max-w-3xl text-balance font-bold text-4xl md:text-6xl">
            I will not ship a second editor.
          </h1>
          <p className="measure mt-6 text-balance text-lg text-muted-foreground md:text-xl">
            I built Blode.md so docs stay in the repo, in the editor I already
            use. The pull request is the review. The merge publishes the site.
            How agents find that Markdown on the open web is covered in our{" "}
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
                Git-native MDX, without the extras
              </h2>
            </div>
            <div className="measure flex flex-col gap-6 text-muted-foreground">
              <p>
                Other git-native docs hosts added a web editor that commits back
                to the repo, plus a marketplace. I will not. A second editor
                splits the release. If your team writes docs in a CMS, this is
                the wrong tool.
              </p>
              <p>
                The surface stays small. No plugin marketplace, no SOC 2, no
                SSO, no logo wall. Support is me. If a feature does not move
                docs closer to the code, it does not ship.
              </p>
              <p>
                Hosted is $0. The CLI and renderer are MIT — same binary on your
                Postgres if you want to run it yourself. See{" "}
                <Link className="underline underline-offset-4" href="/pricing">
                  pricing
                </Link>{" "}
                for both paths, or read the{" "}
                <Link className="underline underline-offset-4" href="/docs">
                  docs
                </Link>
                .
              </p>
              <p>
                The longer version of why this exists is in{" "}
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
                . MIT licensed.
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
