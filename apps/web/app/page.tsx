import { ArrowRightIcon, CodeIcon, GithubIcon } from "blode-icons-react";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
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

/** Visible publish / last-updated date for freshness and AI citation signals. */
const HOME_UPDATED_AT = "2026-08-13";

const faqs = [
  {
    answer:
      "People who already write MDX in git and review docs in a pull request. If you want a visual editor, a plugin marketplace, or a CMS, this is the wrong tool.",
    question: "Who should use Blode.md?",
  },
  {
    answer:
      "Mintlify Starter is also $0 and includes a web editor. We will not ship one. The merge publishes the site plus llms.txt from that commit. We do not claim drop-in compatibility with every Mintlify config key.",
    question: "How is this different from Mintlify?",
  },
  {
    answer:
      "Hosted Blode.md is $0: unlimited projects, pages, and team seats, with custom domains, search, MDX, and API references included. What you do not get: a visual editor, a plugin marketplace, SOC 2, SSO, an SLA, or a logo wall. Support is the founder. The CLI and renderer are MIT if you want the same binary on your Postgres. See the pricing page.",
    question: "How much does Blode.md cost?",
  },
  {
    answer:
      "No. The pull request is the review. If your team writes docs in a CMS instead of git, this is the wrong tool.",
    question: "Is there a visual editor?",
  },
  {
    answer:
      "On every deploy the site writes llms.txt, llms-full.txt, robots.txt, a sitemap, and per-page .md exports from the MDX. Agents fetch those files instead of scraping HTML. Humans still get the HTML site from the same commit.",
    question: "Do agents get Markdown, or only the HTML site?",
  },
  {
    answer:
      "Blode.md is built by Matthew Blode. Email m@blode.co or open an issue on GitHub at github.com/mblode/blodemd. The source is MIT.",
    question: "Who builds Blode.md and how do I get support?",
  },
];

const homeJsonLd = pageJsonLd(
  webPageNode({
    description: HOME_DESCRIPTION,
    extra: {
      dateModified: HOME_UPDATED_AT,
      datePublished: "2025-01-01",
      mainEntity: { "@id": `${marketingUrl("/")}#faq` },
    },
    name: HOME_TITLE,
    path: "/",
  }),
  faqPageNode("/", faqs)
);

const insides: {
  body: string;
  href?: string;
  hrefLabel?: string;
  title: string;
}[] = [
  {
    body: "llms.txt, llms-full.txt, and per-page .md exports are written from the same MDX as the HTML. Agents fetch those files instead of scraping a stale page.",
    title: "Markdown from that commit",
  },
  {
    body: "Proxy /docs through the site you already run. Paste-ready configs for Vercel, Cloudflare, Nginx, and Caddy live in the guides, not as a second product.",
    href: "/docs/guides/proxy-vercel",
    hrefLabel: "Read the proxy guides",
    title: "On the domain they already trust",
  },
  {
    body: "Same CLI and renderer, your Postgres. No license keys. If hosted goes away, you still have the source.",
    href: siteConfig.links.github,
    hrefLabel: "View on GitHub",
    title: "MIT if I disappear",
  },
];

export default function HomePage() {
  return (
    <MarketingShell>
      <JsonLd data={homeJsonLd} />
      <section className="pb-16 pt-[calc(var(--header-height)+4rem)] md:pb-24 md:pt-[calc(var(--header-height)+7rem)] lg:pt-[calc(var(--header-height)+9rem)]">
        <div className="container flex flex-col items-center text-center">
          <h1 className="sr-only">
            The answer they read matches the commit you merged.
          </h1>
          <TextEffect
            aria-hidden="true"
            as="div"
            className="h-display mx-auto max-w-5xl text-balance text-5xl font-semibold sm:text-6xl md:text-7xl lg:text-[88px]"
            per="word"
            preset="fade-in-blur"
            speedSegment={0.3}
          >
            The answer they read matches the commit you merged.
          </TextEffect>

          <TextEffect
            as="p"
            className="mx-auto mt-8 max-w-xl text-balance text-base text-muted-foreground md:text-lg"
            delay={0.55}
            per="word"
            preset="fade-in-blur"
            speedSegment={0.2}
          >
            I built this for people who already write MDX in git. Hosted is $0.
            MIT if I disappear.
          </TextEffect>
          <p className="mt-4 text-muted-foreground text-sm">
            {SITE_NAME}
            <span aria-hidden="true"> · </span>
            Last updated <time dateTime={HOME_UPDATED_AT}>13 August 2026</time>
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
        <TextReveal>No second editor. On purpose.</TextReveal>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container">
          <div className="measure mx-auto flex flex-col gap-6 text-muted-foreground md:text-lg">
            <p>
              Git-native docs hosts added a web editor that commits back to the
              repo, plus a marketplace. If you want that, that product exists.
            </p>
            <p>
              If you want a CMS, this is the wrong tool. You&apos;re not looking
              for a second review flow.
            </p>
            <p>
              Write MDX in the repo. The pull request is the review. The merge
              publishes the site, including the Markdown agents fetch from that
              commit.
            </p>
          </div>
        </div>
      </section>

      <section
        className="border-t border-border py-24 md:py-32"
        id="how-it-works"
      >
        <div className="container">
          <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-start">
            <div className="min-w-0">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                What&apos;s inside
              </p>
              <h2 className="h-title text-balance text-3xl font-semibold md:text-4xl">
                The merge is the deploy
              </h2>
              <p className="measure mt-4 text-muted-foreground">
                Sign in with GitHub and push. You do not run Docusaurus, a
                search index, or a custom-domain pipeline to get a public URL.
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

          <ol className="mt-16 grid gap-10 border-t border-border pt-16 md:grid-cols-3">
            {insides.map((item, index) => (
              <li key={item.title}>
                <p className="mb-3 font-mono text-muted-foreground text-sm">
                  {String(index + 2).padStart(2, "0")}
                </p>
                <h3 className="h-title text-balance font-semibold text-xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-muted-foreground">{item.body}</p>
                {item.href ? (
                  <div className="mt-4">
                    <Button asChild variant="outline">
                      {item.href.startsWith("http") ? (
                        <a
                          href={item.href}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {item.hrefLabel}
                          <ArrowRightIcon data-icon="inline-end" />
                        </a>
                      ) : (
                        <Link href={item.href}>
                          {item.hrefLabel}
                          <ArrowRightIcon data-icon="inline-end" />
                        </Link>
                      )}
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border py-24 md:py-32">
        <div className="container">
          <p className="mb-4 text-sm font-medium text-muted-foreground">
            Choose your edition
          </p>
          <h2 className="h-title max-w-2xl text-balance text-3xl font-semibold md:text-4xl">
            Named for what you do not get
          </h2>
          <p className="measure mt-4 text-muted-foreground">
            Same renderer either way. Hosted is $0: no visual editor, no
            marketplace, no SOC 2. What you do not get is on{" "}
            <Link className="underline underline-offset-4" href="/pricing">
              pricing
            </Link>
            .
          </p>
          <div className="mt-12 grid gap-3 md:grid-cols-2">
            <Card className="justify-start">
              <CardHeader>
                <p className="mb-2 text-muted-foreground text-sm">$0 hosted</p>
                <CardTitle className="text-2xl">No second editor</CardTitle>
                <CardDescription>
                  Sign in with GitHub and push. Custom domains, search, MDX, and
                  API references included. No visual editor, no marketplace.
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
                  Clone the repo, point it at a Postgres, and run the same CLI.
                  No license keys, no telemetry.
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
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                About
              </p>
              <h2 className="h-title text-balance text-3xl font-semibold md:text-4xl">
                One founder. The source is MIT.
              </h2>
            </div>
            <div className="measure flex flex-col gap-6 text-muted-foreground">
              <p>
                I built Blode.md so docs stay in the repo, in the editor I
                already use. Support is me:{" "}
                <a
                  className="underline underline-offset-4"
                  href={`mailto:${siteConfig.links.email}`}
                >
                  {siteConfig.links.email}
                </a>
                , or a GitHub issue. There is no logo wall. I will not invent
                one.
              </p>
              <div>
                <Button asChild variant="outline">
                  <Link href="/about">
                    Read the about page
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
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                FAQ
              </p>
              <h2 className="h-title text-balance text-3xl font-semibold md:text-4xl">
                Who this is for
              </h2>
              <p className="measure mt-4 text-muted-foreground">
                And who it is not. Hosted is $0. The CLI is MIT if you want to
                run it yourself.
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
            Docs that match the code you shipped.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-balance text-muted-foreground md:text-lg">
            Connect GitHub. Hosted is $0. Or clone the MIT repo and run the same
            CLI.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full" size="lg">
              <SignupLink location="home_cta">Connect GitHub</SignupLink>
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
