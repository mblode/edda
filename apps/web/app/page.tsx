import {
  ArrowRightIcon,
  BookIcon,
  CodeIcon,
  GithubIcon,
  LayersTwoIcon,
  MagnifyingGlassIcon,
  WorldIcon,
} from "blode-icons-react";
import Link from "next/link";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { HeroMedia } from "@/components/ui/hero-media";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { SignupLink } from "@/components/ui/signup-link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TextEffect } from "@/components/ui/text-effect";
import { TextReveal } from "@/components/ui/text-reveal";
import {
  HOME_DESCRIPTION,
  HOME_TITLE,
  marketingUrl,
  pageMetadata,
  SITE_NAME,
} from "@/lib/marketing-site";

// Repeats the root layout's title and description so the home page carries its
// own canonical and og:url without changing what it already advertises.
export const metadata = pageMetadata({
  description: HOME_DESCRIPTION,
  path: "/",
  title: HOME_TITLE,
});

/** Visible publish / last-updated date for freshness and AI citation signals. */
const HOME_UPDATED_AT = "2026-08-12";

const faqs = [
  {
    answer:
      "Blode.md publishes MDX from your git repo. The pull request is the review. The merge is the deploy. You get a searchable site on your domain, plus llms.txt and per-page Markdown from that same commit.",
    question: "What is Blode.md?",
  },
  {
    answer:
      "Hosted Blode.md is $0: unlimited projects, pages, and team seats, with custom domains, search, MDX components, and API references included. The CLI and renderer are MIT-licensed if you prefer to self-host. See the pricing page for plan details.",
    question: "How much does Blode.md cost?",
  },
  {
    answer:
      "Install the CLI with npm i -g blodemd, run blodemd login, scaffold with blodemd new docs, then blodemd push docs. Or connect a GitHub repo once a docs folder with docs.json exists; every push to main deploys automatically.",
    question: "How do I get started?",
  },
  {
    answer:
      "On every deploy the site writes llms.txt, llms-full.txt, robots.txt, a sitemap, and per-page .md exports from the MDX. Agents fetch those files instead of scraping HTML. Humans still get the HTML site from the same commit.",
    question: "Do agents get Markdown, or only the HTML site?",
  },
  {
    answer:
      "Blode.md is built by Matthew Blode. For support, email m@blode.co or open an issue on the GitHub repository at github.com/mblode/blodemd. Company background is on the About page at blode.md/about.",
    question: "Who builds Blode.md and how do I get support?",
  },
];

const homeJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      dateModified: HOME_UPDATED_AT,
      datePublished: "2025-01-01",
      description: HOME_DESCRIPTION,
      name: HOME_TITLE,
      url: marketingUrl("/"),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
        name: faq.question,
      })),
    },
  ],
};

const features = [
  {
    Icon: GithubIcon,
    description:
      "Install the GitHub App. Every push to main publishes. No workflow file to keep.",
    title: "GitHub auto-deploy",
  },
  {
    Icon: WorldIcon,
    description:
      "Point a domain, get SSL. Or proxy /docs on the site you already run.",
    title: "Custom domains",
  },
  {
    Icon: CodeIcon,
    description: "40 components: callouts, tabs, code groups, OpenAPI refs.",
    title: "MDX components",
  },
  {
    Icon: MagnifyingGlassIcon,
    description: "One full-text index. Same results in the docs search box.",
    title: "Search",
  },
  {
    Icon: LayersTwoIcon,
    description:
      "Docs, blogs, changelogs, and courses on one domain, from one repo.",
    title: "Content types",
  },
  {
    Icon: BookIcon,
    description:
      "Point docs.json at an OpenAPI spec. Ship the reference in the same deploy.",
    title: "API reference",
  },
];

const proxySnippets = {
  caddy: `# Caddyfile
yourdomain.com {
  reverse_proxy /docs/* https://acme.blode.md {
    header_up Host acme.blode.md
  }
}`,
  cloudflare: `// worker.js
export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/docs')) {
      return fetch(
        \`https://acme.blode.md\${url.pathname.replace('/docs', '')}\`,
      );
    }
    return fetch(request);
  },
};`,
  nginx: `# nginx.conf
location /docs/ {
  proxy_pass https://acme.blode.md/;
  proxy_set_header Host acme.blode.md;
}`,
  vercel: `// next.config.js
async rewrites() {
  return [
    { source: '/docs/:path*',
      destination: 'https://acme.blode.md/:path*' },
  ];
}`,
};

export default function HomePage() {
  return (
    <MarketingShell>
      <script
        // oxlint-disable-next-line no-danger -- page-level WebPage + FAQPage JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
        type="application/ld+json"
      />
      <section className="pb-16 pt-[calc(var(--header-height)+4rem)] md:pb-24 md:pt-[calc(var(--header-height)+7rem)] lg:pt-[calc(var(--header-height)+9rem)]">
        <div className="container flex flex-col items-center text-center">
          <h1 className="sr-only">Docs that match the code you shipped.</h1>
          <TextEffect
            aria-hidden="true"
            as="div"
            className="h-display mx-auto max-w-5xl text-balance text-5xl font-semibold sm:text-6xl md:text-7xl lg:text-[88px]"
            per="word"
            preset="fade-in-blur"
            speedSegment={0.3}
          >
            Docs that match the code you shipped.
          </TextEffect>

          <TextEffect
            as="p"
            className="mx-auto mt-8 max-w-xl text-balance text-base text-muted-foreground md:text-lg"
            delay={0.55}
            per="word"
            preset="fade-in-blur"
            speedSegment={0.2}
          >
            Write MDX in the repo. The pull request is the review. The merge
            publishes the site, including the Markdown files agents fetch from
            that commit.
          </TextEffect>
          <p className="mt-4 text-muted-foreground text-sm">
            {SITE_NAME}
            <span aria-hidden="true"> · </span>
            Last updated <time dateTime={HOME_UPDATED_AT}>12 August 2026</time>
          </p>

          <AnimatedGroup
            className="mt-10 flex flex-wrap items-center justify-center gap-3"
            variants={{
              container: {
                hidden: {},
                visible: {
                  transition: {
                    delayChildren: 0.8,
                    staggerChildren: 0.08,
                  },
                },
              },
            }}
          >
            <Button asChild className="rounded-full" size="lg">
              <SignupLink location="home_hero">Start shipping</SignupLink>
            </Button>

            <Button
              asChild
              className="rounded-full"
              size="lg"
              variant="secondary"
            >
              <Link href="/docs">Read the docs</Link>
            </Button>
          </AnimatedGroup>
        </div>
        <AnimatedGroup
          className="mt-20 md:mt-24"
          variants={{
            container: {
              hidden: {},
              visible: {
                transition: {
                  delayChildren: 0.95,
                  staggerChildren: 0.05,
                },
              },
            },
          }}
        >
          <HeroMedia />
        </AnimatedGroup>
      </section>

      <section>
        <TextReveal>
          A folder of MDX in git becomes the docs on your domain. Reviewed in
          the pull request. Rebuilt on the merge.
        </TextReveal>
      </section>

      <section className="py-24 md:py-32" id="how-it-works">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div className="min-w-0">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                How it works
              </p>
              <h2 className="h-title text-balance text-3xl font-semibold md:text-4xl">
                The merge is the deploy
              </h2>
              <p className="measure mt-4 text-muted-foreground">
                Docs that live in a separate CMS lag the release. Then the agent
                answering your users cites the old API. Blode.md publishes from
                the same commit you merged.
              </p>
            </div>
            <Tabs className="min-w-0" defaultValue="cli">
              <TabsList>
                <TabsTrigger value="cli">
                  <CodeIcon data-icon="inline-start" />
                  CLI
                </TabsTrigger>
                <TabsTrigger value="github">
                  <GithubIcon data-icon="inline-start" />
                  GitHub
                </TabsTrigger>
              </TabsList>

              <TabsContent className="mt-6 min-w-0" value="cli">
                <div className="relative overflow-hidden rounded-xl bg-surface px-6 pb-6 pt-14 font-mono text-sm md:p-8 md:pt-8">
                  <CopyButton
                    className="absolute right-3 top-3 text-muted-foreground"
                    content={`npm i -g blodemd\nblodemd login\nblodemd new docs\nblodemd push docs`}
                    size="sm"
                    variant="ghost"
                  />
                  <div className="space-y-6">
                    <div>
                      <p className="text-muted-foreground"># install the CLI</p>
                      <p className="break-words">
                        <span className="text-muted-foreground">$</span> npm i
                        -g blodemd
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        # browser sign-in with GitHub
                      </p>
                      <p className="break-words">
                        <span className="text-muted-foreground">$</span> blodemd
                        login
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">
                        # scaffold from your project root
                      </p>
                      <p className="break-words">
                        <span className="text-muted-foreground">$</span> blodemd
                        new docs
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground"># ship it</p>
                      <p className="break-words">
                        <span className="text-muted-foreground">$</span> blodemd
                        push docs
                      </p>
                    </div>
                    <p className="text-muted-foreground">
                      Deployed to acme.blode.md
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent className="mt-6 min-w-0" value="github">
                <div className="overflow-hidden rounded-xl bg-surface p-6 text-sm md:p-8">
                  <ol className="space-y-4">
                    <li className="flex gap-3">
                      <span className="text-muted-foreground">1.</span>
                      <span className="min-w-0 break-words">
                        Add a{" "}
                        <span className="font-mono text-foreground">docs/</span>{" "}
                        folder first (or run{" "}
                        <span className="font-mono text-foreground">
                          blodemd new docs
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
                        Point at the folder with{" "}
                        <span className="font-mono text-foreground">
                          docs.json
                        </span>
                        , then push to{" "}
                        <span className="font-mono text-foreground">main</span>
                      </span>
                    </li>
                  </ol>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24 md:py-32">
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <p className="mb-4 text-sm font-medium text-muted-foreground">
              What you get
            </p>
            <h2 className="h-title text-balance text-3xl font-semibold md:text-4xl">
              What the merge publishes
            </h2>
            <p className="measure mt-4 text-muted-foreground">
              Components, hosting, search, and an API reference, all from the
              MDX you already write. Hosted Blode.md is $0 with unlimited
              projects, pages, and seats — see{" "}
              <Link className="underline underline-offset-4" href="/pricing">
                pricing
              </Link>
              . How agents find that Markdown on the open web is in our{" "}
              <Link
                className="underline underline-offset-4"
                href="/free-online-llms-txt-resources"
              >
                free online llms.txt resources
              </Link>
              .
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, description }) => (
              <Card className="justify-start" key={title}>
                <CardHeader>
                  <div className="mb-3 inline-flex size-9 items-center justify-center rounded-lg bg-muted text-foreground">
                    <Icon />
                  </div>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24 md:py-32">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div className="min-w-0">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                On your domain
              </p>
              <h2 className="h-title text-balance text-3xl font-semibold md:text-4xl">
                Keep docs on the domain they already trust
              </h2>
              <p className="measure mt-4 text-muted-foreground">
                Proxy /docs through the marketing site. Paste-ready configs for
                Vercel, Cloudflare, Nginx, and Caddy. The hostname already on
                that site is the one that serves the commit you merged.
              </p>
              <div className="mt-6">
                <Button asChild variant="outline">
                  <Link href="/docs/guides/proxy-vercel">
                    Read the proxy guides
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>
            <Tabs className="min-w-0" defaultValue="vercel">
              <TabsList className="max-w-full overflow-x-auto no-scrollbar">
                <TabsTrigger value="vercel">Vercel</TabsTrigger>
                <TabsTrigger value="cloudflare">Cloudflare</TabsTrigger>
                <TabsTrigger value="nginx">Nginx</TabsTrigger>
                <TabsTrigger value="caddy">Caddy</TabsTrigger>
              </TabsList>
              {Object.entries(proxySnippets).map(([key, snippet]) => (
                <TabsContent className="mt-6 min-w-0" key={key} value={key}>
                  <div className="relative min-w-0">
                    <CopyButton
                      className="absolute right-3 top-3 z-10 text-muted-foreground"
                      content={snippet}
                      size="sm"
                      variant="ghost"
                    />
                    <pre className="overflow-x-auto rounded-xl bg-surface px-6 pb-6 pt-14 font-mono text-sm md:p-8 md:pt-8">
                      {snippet}
                    </pre>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      <section className="border-t border-border py-24 md:py-32" id="faq">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div className="min-w-0">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                FAQ
              </p>
              <h2 className="h-title text-balance text-3xl font-semibold md:text-4xl">
                Common questions
              </h2>
              <p className="measure mt-4 text-muted-foreground">
                Short answers about git-native publish, pricing, Markdown
                exports for agents, and how to reach the team. More detail lives
                in the{" "}
                <Link className="underline underline-offset-4" href="/docs">
                  docs
                </Link>
                ,{" "}
                <Link className="underline underline-offset-4" href="/pricing">
                  pricing
                </Link>
                , and{" "}
                <Link className="underline underline-offset-4" href="/about">
                  about
                </Link>{" "}
                pages.
              </p>
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

      <section className="border-t border-border py-28 md:py-40">
        <div
          className="container flex flex-col items-center text-center"
          id="get-started"
        >
          <h2 className="h-display mx-auto max-w-4xl text-balance text-5xl font-semibold md:text-6xl lg:text-7xl">
            Push a docs folder. You&apos;re live.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-balance text-muted-foreground md:text-lg">
            Run{" "}
            <span className="font-mono text-foreground">blodemd new docs</span>,
            push, and the site is up. Or connect GitHub once you have a docs
            folder. Every push to main publishes from there.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full" size="lg">
              <SignupLink location="home_cta">Start shipping</SignupLink>
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
      </section>
    </MarketingShell>
  );
}
