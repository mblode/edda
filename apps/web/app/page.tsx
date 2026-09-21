import { ArrowRightIcon, CodeIcon, GithubIcon } from "blode-icons-react";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeroMedia } from "@/components/ui/hero-media";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { SignupLink } from "@/components/ui/signup-link";
import { siteConfig } from "@/lib/config";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  marketingUrl,
  pageMetadata,
  SITE_NAME,
} from "@/lib/marketing-site";
import { faqPageNode, pageJsonLd, webPageNode } from "@/lib/structured-data";

// Repeats the root layout's title and description so the home page carries its
// own canonical and og:url without changing what it already advertises.
export const metadata = pageMetadata({
  description: HOME_DESCRIPTION,
  path: "/",
  title: HOME_TITLE,
});

/** Date of the latest substantive homepage edit. */
const HOME_UPDATED_AT = "2026-09-21";

const faqs = [
  {
    answer:
      "Mintlify Starter is also $0 and includes a web editor. Edda keeps writing and review in git. Mintlify configs may need changes.",
    question: "How is this different from Mintlify?",
  },
  {
    answer:
      "Every deploy generates llms.txt, llms-full.txt and per-page Markdown from the same MDX as the HTML. Each Markdown page links back to llms.txt.",
    question: "What do agents get?",
  },
];

const homeJsonLd = pageJsonLd(
  webPageNode({
    description: HOME_DESCRIPTION,
    extra: {
      dateModified: HOME_UPDATED_AT,
      mainEntity: { "@id": `${marketingUrl("/")}#faq` },
      breadcrumb: { "@id": `${marketingUrl("/")}#breadcrumb` },
    },
    name: HOME_TITLE,
    path: "/",
  }),
  faqPageNode("/", faqs),
  {
    "@type": "BreadcrumbList",
    "@id": `${marketingUrl("/")}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Matthew Blode",
        item: "https://blode.co",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Projects",
        item: "https://blode.co/projects",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Edda",
        item: marketingUrl("/"),
      },
    ],
  }
);

export default function HomePage() {
  return (
    <MarketingShell staticLanding>
      <JsonLd data={homeJsonLd} />
      <script src="/landing.js" defer />
      <section className="pb-16 pt-[calc(var(--header-height)+4rem)] md:pb-24 md:pt-[calc(var(--header-height)+7rem)] lg:pt-[calc(var(--header-height)+9rem)]">
        <div className="container flex flex-col items-center text-center">
          <nav
            aria-label="Breadcrumb"
            className="mb-6 text-sm text-muted-foreground"
          >
            <ol className="flex flex-wrap justify-center gap-2">
              <li>
                <a
                  className="underline-offset-4 hover:underline"
                  href="https://blode.co"
                  rel="author"
                >
                  Matthew Blode
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <a
                  className="underline-offset-4 hover:underline"
                  href="https://blode.co/projects"
                >
                  Projects
                </a>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">Edda</li>
            </ol>
          </nav>
          <h1 className="h-display mx-auto max-w-5xl text-balance text-5xl font-semibold sm:text-6xl md:text-7xl lg:text-[88px]">
            {HOME_TITLE}
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
            Write MDX. Review the pull request. Merge to publish HTML and
            agent-readable Markdown. Hosted is $0. The source is MIT.
          </p>
          <p className="mt-4 text-muted-foreground text-sm">
            {SITE_NAME}
            <span aria-hidden="true"> · </span>
            Last updated{" "}
            <time dateTime={HOME_UPDATED_AT}>21 September 2026</time>
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full" size="lg">
              <SignupLink location="home_hero">Connect GitHub</SignupLink>
            </Button>

            <Button
              asChild
              className="rounded-full"
              size="lg"
              variant="secondary"
            >
              <Link href="/docs">Read the docs</Link>
            </Button>
          </div>
        </div>
        <div className="mt-20 md:mt-24">
          <HeroMedia />
        </div>
      </section>

      <section className="container pb-16 text-center md:pb-24">
        <h2 className="h-display text-3xl font-semibold md:text-5xl">
          No second editor. On purpose.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-muted-foreground md:text-lg">
          Your editor, your repo, your pull request. Edda handles publishing.
        </p>
      </section>

      <section
        className="border-t border-border py-24 md:py-32"
        id="how-it-works"
      >
        <div className="container">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div className="min-w-0">
              <h2 className="h-title text-balance text-3xl font-semibold md:text-4xl">
                The merge is the deploy
              </h2>
              <p className="measure mt-4 text-muted-foreground">
                Connect GitHub or publish from the CLI. Use a custom domain or
                proxy /docs through your existing site.
              </p>
              <div className="mt-6 flex flex-col items-start gap-3">
                <Link
                  className="underline underline-offset-4"
                  href="/docs/quickstart"
                >
                  Setup guide
                </Link>
                <Link
                  className="underline underline-offset-4"
                  href="/docs/guides/proxy-vercel"
                >
                  Proxy guides
                </Link>
              </div>
            </div>
            <div className="min-w-0 space-y-4">
              <details className="rounded-xl border border-border p-4" open>
                <summary className="flex cursor-pointer items-center gap-2 font-medium">
                  <CodeIcon className="size-4" />
                  CLI installation
                </summary>
                <div className="relative overflow-hidden rounded-xl bg-surface px-6 pb-6 pt-6 font-mono text-sm md:p-8 md:pt-8">
                  <button
                    type="button"
                    aria-label="Copy install commands"
                    data-copy-command={
                      "npm i -g edda-docs\nedda login\nedda new docs\nedda push docs"
                    }
                    className="mb-4 rounded-md border border-border px-3 py-2 font-sans text-sm hover:bg-muted"
                  >
                    Copy commands
                  </button>
                  <p
                    data-copy-status
                    role="status"
                    aria-live="polite"
                    className="mb-4 min-h-5 font-sans text-sm text-muted-foreground"
                  />
                  <pre
                    aria-label="Install commands"
                    className="whitespace-pre-wrap break-words leading-7"
                  >
                    <code>
                      {
                        "npm i -g edda-docs\nedda login\nedda new docs\nedda push docs"
                      }
                    </code>
                  </pre>
                </div>
              </details>

              <details className="rounded-xl border border-border p-4">
                <summary className="flex cursor-pointer items-center gap-2 font-medium">
                  <GithubIcon className="size-4" />
                  Connect GitHub
                </summary>
                <div className="overflow-hidden rounded-xl bg-surface p-6 text-sm md:p-8">
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="text-muted-foreground">1.</span>
                      <span className="min-w-0 break-words">
                        Add a{" "}
                        <span className="font-mono text-foreground">docs/</span>{" "}
                        folder (or run{" "}
                        <span className="font-mono text-foreground">
                          edda new docs
                        </span>
                        )
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-muted-foreground">2.</span>
                      <span className="min-w-0 break-words">
                        Sign in with GitHub and pick the repo
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-muted-foreground">3.</span>
                      <span className="min-w-0 break-words">
                        Select the folder with{" "}
                        <span className="font-mono text-foreground">
                          docs.json
                        </span>
                        , then push to{" "}
                        <span className="font-mono text-foreground">main</span>
                      </span>
                    </li>
                  </ol>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24 md:py-32">
        <div className="container">
          <h2
            id="pricing"
            className="h-title scroll-mt-24 max-w-2xl text-balance text-3xl font-semibold md:text-4xl"
          >
            Hosted or self-hosted
          </h2>
          <p className="measure mt-4 text-muted-foreground">
            No visual editor, plugin marketplace, SOC 2, SSO or SLA. Support is
            the founder.
          </p>
          <div className="mt-12 grid gap-3 md:grid-cols-2">
            <Card className="justify-start">
              <CardHeader>
                <p className="mb-2 text-muted-foreground text-sm">$0 hosted</p>
                <CardTitle className="text-2xl">No second editor</CardTitle>
                <CardDescription>
                  Unlimited projects, pages and seats. Custom domains, search,
                  MDX and API references included.
                </CardDescription>
                <div className="pt-4">
                  <Button asChild>
                    <SignupLink location="home_edition_hosted">
                      Connect GitHub
                      <ArrowRightIcon data-icon="inline-end" />
                    </SignupLink>
                  </Button>
                </div>
              </CardHeader>
            </Card>
            <Card className="justify-start">
              <CardHeader>
                <p className="mb-2 text-muted-foreground text-sm">MIT</p>
                <CardTitle className="text-2xl">Your Postgres</CardTitle>
                <CardDescription>
                  Self-host the same CLI and renderer on your Postgres. No
                  license keys or telemetry.
                </CardDescription>
                <div className="pt-4">
                  <Button asChild variant="outline">
                    <a
                      href={siteConfig.links.github}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      View on GitHub
                      <ArrowRightIcon data-icon="inline-end" />
                    </a>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24 md:py-32">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div className="min-w-0">
              <h2
                id="about"
                className="h-title scroll-mt-24 text-balance text-3xl font-semibold md:text-4xl"
              >
                Built by Matthew Blode
              </h2>
            </div>
            <div className="measure flex flex-col gap-6 text-muted-foreground">
              <p>
                I built Edda to keep docs in my repo. For support, email{" "}
                <a
                  className="underline underline-offset-4"
                  href={`mailto:${siteConfig.links.email}`}
                >
                  {siteConfig.links.email}
                </a>
                {" or "}
                <a
                  className="underline underline-offset-4"
                  href={`${siteConfig.links.github}/issues`}
                >
                  open an issue
                </a>
                .
              </p>
              <div>
                <Button asChild variant="outline">
                  <Link href="https://blode.co">
                    More about Matthew
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24 md:py-32" id="faq">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div className="min-w-0">
              <h2 className="h-title text-balance text-3xl font-semibold md:text-4xl">
                FAQ
              </h2>
              <Link
                className="mt-6 inline-flex underline underline-offset-4"
                href="/docs/features/agent-readable-docs"
              >
                Agent-readable docs
              </Link>
            </div>
            <dl className="flex flex-col divide-y divide-border">
              {faqs.map((faq) => (
                <div className="py-6 first:pt-0 last:pb-0" key={faq.question}>
                  <dt className="font-medium text-base">{faq.question}</dt>
                  <dd className="mt-3 text-muted-foreground">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
