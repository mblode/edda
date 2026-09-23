import { ArrowRightIcon } from "blode-icons-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { JsonLd } from "@/components/json-ld";
import { CtaClose } from "@/components/marketing/cta-close";
import { Faq, faqJsonLd } from "@/components/marketing/faq";
import { FeatureRows } from "@/components/marketing/feature-rows";
import { InstallCommand } from "@/components/marketing/install-command";
import { MarketingHero } from "@/components/marketing/marketing-hero";
import { MdxDemo } from "@/components/marketing/mdx-demo";
import { ProofStats } from "@/components/marketing/proof-stats";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { siteConfig } from "@/lib/config";
import { HOME_FAQS } from "@/lib/home-faqs";
import {
  HOME_DESCRIPTION,
  HOME_EYEBROW,
  HOME_HEADLINE,
  HOME_SUBHEAD,
  HOME_TITLE,
  KNOWLEDGE_REPORT_URL,
  MARKETING_HOME,
  marketingUrl,
  pageMetadata,
} from "@/lib/marketing-site";
import { DEMO_INDEX_QUOTE } from "@/lib/mdx-demo";
import {
  pageJsonLd,
  SOFTWARE_ID,
  softwareApplicationNode,
  webPageNode,
} from "@/lib/structured-data";

// The landing route and the legal pages it links to must navigate instantly.
// e2e/web-instant.spec.ts guards the same routes with @next/playwright.
export const instant = true;

export const metadata = pageMetadata({
  description: HOME_DESCRIPTION,
  path: "/",
  title: HOME_TITLE,
});

/** Date of the latest substantive homepage edit. */
const HOME_UPDATED_AT = "2026-09-22";
const HOME_UPDATED_LABEL = "22 September 2026";

/** The one primary action. Same label everywhere it repeats. */
const CTA_LABEL = "Connect GitHub to publish";
const SIGNUP_HREF = "/oauth/consent";

const INSTALL_COMMANDS = [
  {
    command: "npm i -g edda-docs\nedda login\nedda new docs\nedda push docs",
    label: "CLI",
  },
];

const homeJsonLd = pageJsonLd(
  webPageNode({
    description: HOME_DESCRIPTION,
    extra: {
      about: { "@id": SOFTWARE_ID },
      dateModified: HOME_UPDATED_AT,
      mainEntity: { "@id": `${marketingUrl("/")}#faq` },
    },
    name: HOME_TITLE,
    path: "/",
  }),
  softwareApplicationNode({
    description: HOME_SUBHEAD,
    offerUrl: `${MARKETING_HOME}#pricing`,
  }),
  faqJsonLd(HOME_FAQS)
);

/** Mintlify's figures, quoted as the report gives them. Add no others. */
const READER_STATS = [
  {
    label:
      "agent requests vs 131M human page loads, across Mintlify-hosted docs in August 2026",
    value: "257M",
  },
  {
    label: "of agent traffic came through .md pages, llms.txt or agent skills",
    value: "83%",
  },
  {
    label:
      "failed requests per task when Markdown links to an index, vs 2.23 for HTML",
    value: "0.11",
  },
] as const;

/**
 * blode.co/edda serves this page as HTML without React, so the CTA is a plain
 * link. `public/landing.js` reports `cta_clicked` from the data attributes.
 */
const PrimaryCta = ({
  location,
  size = "lg",
}: {
  location: string;
  size?: "default" | "lg";
}) => (
  <Button asChild className="rounded-full" size={size}>
    <a
      data-cta-label={CTA_LABEL}
      data-cta-location={location}
      href={SIGNUP_HREF}
    >
      {CTA_LABEL}
    </a>
  </Button>
);

const CodeMedia = ({ caption, code }: { caption: string; code: string }) => (
  <figure className="overflow-hidden rounded-xl bg-surface">
    <figcaption className="border-border border-b px-4 py-3 font-mono text-muted-foreground text-xs">
      {caption}
    </figcaption>
    <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 md:text-sm">
      <code>{code}</code>
    </pre>
  </figure>
);

const DiffMedia = () => (
  <figure className="overflow-hidden rounded-xl bg-surface">
    <figcaption className="border-border border-b px-4 py-3 font-mono text-muted-foreground text-xs">
      docs/quickstart.mdx
    </figcaption>
    <pre className="overflow-x-auto py-4 font-mono text-[13px] leading-6 md:text-sm">
      <code className="block px-4">## Publish</code>
      <code className="block bg-red-500/10 px-4">
        <span aria-hidden="true">- </span>
        <span className="sr-only">Removed: </span>
        Run `edda push`.
      </code>
      <code className="block bg-emerald-500/10 px-4">
        <span aria-hidden="true">+ </span>
        <span className="sr-only">Added: </span>
        Run `edda push docs`.
      </code>
    </pre>
  </figure>
);

const textLink =
  "rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring";

const features: { description: string; media: ReactNode; title: string }[] = [
  {
    description:
      "Each page has a .md twin that opens with a link to llms.txt, so an agent that lands on one page can find the rest instead of guessing URLs.",
    media: (
      <CodeMedia
        caption="acme.blode.md/quickstart.md"
        code={`${DEMO_INDEX_QUOTE}\n\n# Quickstart`}
      />
    ),
    title: "Indexed Markdown on every page",
  },
  {
    description:
      "Every page registers five WebMCP tools (search_docs, read_page, get_site_overview, read_skill, navigate_page), so an agent driving a browser tab reads your docs through typed calls.",
    media: (
      <CodeMedia
        caption="document.modelContext.getTools()"
        code={
          "search_docs\nread_page\nget_site_overview\nread_skill\nnavigate_page"
        }
      />
    ),
    title: "Tools for browser agents",
  },
  {
    description:
      "Whether a person or an agent wrote it, a docs change is a diff your team approves beside the code it describes.",
    media: <DiffMedia />,
    title: "Review in the pull request",
  },
  {
    description:
      "The GitHub App deploys on every push to main, so the docs change ships the day the product does.",
    media: (
      <CodeMedia
        caption="With the GitHub App"
        code={
          "git switch main\ngit merge update-quickstart\ngit push\n# deployed to acme.blode.md"
        }
      />
    ),
    title: "Publish on merge",
  },
  {
    description:
      "Use hosted Edda on a blode.md subdomain or your own domain, or run the same MIT CLI and renderer on your Postgres. If hosted goes away, you keep the source.",
    media: (
      <CodeMedia
        caption="Same CLI either way"
        code={
          "# hosted, $0\nedda push docs\n\n# self-hosted, MIT\ngit clone https://github.com/mblode/edda"
        }
      />
    ),
    title: "Hosted or self-hosted",
  },
];

export default function HomePage() {
  return (
    <MarketingShell staticLanding>
      <JsonLd data={homeJsonLd} />
      <script defer src="/landing.js" />

      <MarketingHero
        action={<PrimaryCta location="home_hero" />}
        description={HOME_SUBHEAD}
        eyebrow={
          <p className="text-muted-foreground text-sm">{HOME_EYEBROW}</p>
        }
        secondary={
          <>
            <Link
              className={`${textLink} text-sm`}
              data-cta-location="home_hero_secondary"
              href="/docs"
            >
              Read the docs
            </Link>
            <Link
              className={`${textLink} text-sm`}
              data-cta-location="home_hero_migrate"
              href="/docs/guides/migrate-from-mintlify"
            >
              Moving from Mintlify?
            </Link>
          </>
        }
        title={HOME_HEADLINE}
      >
        <MdxDemo />
      </MarketingHero>

      <section
        aria-labelledby="new-reader-title"
        data-section="agent-reader"
        className="border-border border-t py-24 text-center md:py-32"
      >
        <div className="container" data-reveal>
          <h2
            className="h-title mx-auto max-w-3xl text-balance font-semibold text-3xl md:text-5xl"
            id="new-reader-title"
          >
            Your majority reader is an agent
          </h2>
          <div className="mt-12 md:mt-16">
            <ProofStats stats={READER_STATS} />
          </div>
          <p className="mt-10 text-muted-foreground text-sm">
            Source:{" "}
            <a
              className={textLink}
              href={KNOWLEDGE_REPORT_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              Mintlify, 2026 State of Knowledge Report
            </a>
            .
          </p>
          <p className="measure mx-auto mt-8 text-balance md:text-lg">
            Edda ships all three routes on every deploy, and every Markdown page
            links to the index before its first heading.
          </p>
        </div>
      </section>

      <section
        className="border-border border-t py-24 text-center md:py-32"
        data-section="agents-draft"
      >
        <div className="container" data-reveal>
          <h2 className="h-display text-balance font-semibold text-3xl md:text-5xl">
            Agents draft. People merge.
          </h2>
          <p className="measure mx-auto mt-6 text-balance text-muted-foreground md:text-lg">
            Most teams now have agents drafting docs changes, and most still
            want a person to approve them. In Edda that approval is the pull
            request you already review, and merging it is the publish. No second
            editor, no sync job, no docs that lag the release.
          </p>
        </div>
      </section>

      <section
        aria-labelledby="how-it-works-title"
        className="scroll-mt-24 border-border border-t py-24 md:py-32"
        data-section="how-it-works"
        id="how-it-works"
      >
        <div className="container">
          <h2
            className="h-title mb-16 max-w-2xl text-balance font-semibold text-3xl md:mb-24 md:text-5xl"
            id="how-it-works-title"
          >
            The merge is the deploy
          </h2>
          <FeatureRows items={features} />
        </div>
      </section>

      <section
        aria-labelledby="pricing"
        className="border-border border-t py-24 md:py-32"
        data-section="pricing"
      >
        <div className="container">
          <h2
            className="h-title max-w-2xl scroll-mt-24 text-balance font-semibold text-3xl md:text-5xl"
            id="pricing"
          >
            Hosted or self-hosted
          </h2>
          <p className="measure mt-4 text-muted-foreground md:text-lg">
            No visual editor, plugin marketplace, SOC 2, SSO or SLA. Support is
            the founder.
          </p>
          <div className="mt-12 grid gap-10 md:grid-cols-2 md:gap-16">
            <div className="flex flex-col items-start border-border border-t pt-8">
              <p className="text-muted-foreground text-sm">$0 hosted</p>
              <h3 className="mt-2 font-semibold text-2xl">No second editor</h3>
              <p className="measure mt-3 text-muted-foreground">
                Unlimited projects, pages and seats. Custom domains, search, MDX
                and API references included.
              </p>
              <div className="mt-6">
                <PrimaryCta location="home_pricing_hosted" size="default" />
              </div>
            </div>
            <div className="flex flex-col items-start border-border border-t pt-8">
              <p className="text-muted-foreground text-sm">MIT</p>
              <h3 className="mt-2 font-semibold text-2xl">Your Postgres</h3>
              <p className="measure mt-3 text-muted-foreground">
                Self-host the same CLI and renderer on your Postgres. No licence
                keys or telemetry.
              </p>
              <div className="mt-6">
                <Button asChild className="rounded-full" variant="outline">
                  <a
                    data-cta-location="home_pricing_self_hosted"
                    href={siteConfig.links.github}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    View the source on GitHub
                    <ArrowRightIcon data-icon="inline-end" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="faq-title"
        className="scroll-mt-24 border-border border-t py-24 md:py-32"
        data-section="faq"
        id="faq"
      >
        <div className="container grid gap-12 md:grid-cols-[1fr_1.6fr] md:items-start">
          <div className="min-w-0">
            <h2
              className="h-title text-balance font-semibold text-3xl md:text-5xl"
              id="faq-title"
            >
              FAQ
            </h2>
            <p className="mt-4 text-muted-foreground text-sm">
              Last updated{" "}
              <time dateTime={HOME_UPDATED_AT}>{HOME_UPDATED_LABEL}</time>
            </p>
          </div>
          <Faq items={HOME_FAQS} />
        </div>
      </section>

      <CtaClose
        action={<PrimaryCta location="home_close" />}
        command={<InstallCommand commands={INSTALL_COMMANDS} />}
        description="Give it docs it can navigate, from the commit you merged."
        section="cta-close"
        title="Your next reader is an agent."
      />
    </MarketingShell>
  );
}
