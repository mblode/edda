import { ArrowRightIcon, ChevronLeftIcon } from "blode-icons-react";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { RelativeTime } from "@/components/ui/relative-time";
import { SignupLink } from "@/components/ui/signup-link";
import { marketingUrl, pageMetadata } from "@/lib/marketing-site";
import {
  articleNode,
  breadcrumbNode,
  pageJsonLd,
  webPageNode,
} from "@/lib/structured-data";

const postDescription =
  "Mintlify's 2026 State of Knowledge Report puts agents at 66% of docs traffic and shows a link to llms.txt cutting failed requests 20x. What that means for docs that publish from git.";
const postTitle = "Agents are the majority reader now";
const postPath = "/blog/agents-are-the-majority-reader";
const postDate = "2026-09-19";

export const metadata = pageMetadata({
  description: postDescription,
  path: postPath,
  title: postTitle,
  type: "article",
});

const postJsonLd = pageJsonLd(
  webPageNode({
    description: postDescription,
    extra: { mainEntity: { "@id": `${marketingUrl(postPath)}#article` } },
    name: postTitle,
    path: postPath,
  }),
  articleNode({
    dateModified: postDate,
    datePublished: postDate,
    description: postDescription,
    headline: postTitle,
    path: postPath,
  }),
  breadcrumbNode([
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: postTitle, path: postPath },
  ])
);

const failedRequests = [
  { format: "HTML", perTask: "2.23" },
  { format: "Markdown", perTask: "1.42" },
  { format: "Markdown with a link to llms.txt", perTask: "0.11" },
];

export default function AgentsMajorityReaderPostPage() {
  return (
    <MarketingShell>
      <JsonLd data={postJsonLd} />
      <article>
        <section className="pt-20 pb-12 md:pt-28 md:pb-16">
          <div className="container flex flex-col items-center text-center">
            <Link
              className="mb-10 inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
              href="/blog"
            >
              <ChevronLeftIcon />
              All posts
            </Link>
            <Badge className="mb-6" variant="outline">
              Agents
            </Badge>
            <h1 className="h-display max-w-3xl text-balance font-bold text-4xl md:text-6xl">
              {postTitle}
            </h1>
            <p className="measure mt-6 text-balance text-lg text-muted-foreground md:text-xl">
              A coding agent answering from your docs is answering from the
              commit you merged. This month there is data on how much that
              matters.
            </p>
            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-2 text-muted-foreground text-sm">
              <RelativeTime date={postDate} />
              <span aria-hidden="true">·</span>
              <span>Matthew Blode</span>
            </p>
          </div>
        </section>

        <section className="pb-16 md:pb-24">
          <div className="container">
            <div className="typeset measure mx-auto text-muted-foreground">
              <h2 className="h-display font-bold text-2xl md:text-3xl">
                What the report measured
              </h2>
              <p>
                Mintlify published its{" "}
                <a
                  className="underline underline-offset-4"
                  href="https://www.mintlify.com/state-of-knowledge/2026"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  2026 State of Knowledge Report
                </a>{" "}
                this week, built on server-side traffic from the docs it hosts
                between February and August. In August, agents made 257 million
                requests against 131 million human page loads. That is 66% of
                readership, up from 21% in February, and 83% of it arrived
                through the machine-friendly routes: the <code>.md</code>{" "}
                version of a page, an <code>llms.txt</code> index, or an agent
                skill. Agents request those files only when they know they
                exist.
              </p>
              <p>
                It is the data of the host we compare ourselves against, and it
                argues for the same thing whichever host you pick: the Markdown
                an agent reads has to exist, has to be findable, and has to be
                current.
              </p>

              <h2 className="h-display font-bold text-2xl md:text-3xl">
                Reading was never the problem
              </h2>
              <p>
                The part worth acting on is a controlled benchmark: 2,400 tasks
                across 20 documentation sites, run with Claude and Codex, the
                same docs served four ways. Answer accuracy stayed between 94%
                and 99% in every format. What moved was navigation. Agents fetch
                a page, guess a sibling URL, get a 404, back up, and guess
                again.
              </p>
              <div className="not-typeset overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="py-2 pr-4 font-semibold text-foreground">
                        Format served
                      </th>
                      <th className="py-2 font-semibold text-foreground">
                        Failed requests per task
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {failedRequests.map((row) => (
                      <tr className="border-border border-b" key={row.format}>
                        <td className="py-2 pr-4">{row.format}</td>
                        <td className="py-2 font-mono">{row.perTask}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                Stripping a page to Markdown removes the sidebar with the
                chrome, so a bare <code>.md</code> file leaves an agent with
                nothing to navigate by. One link to the index fixed most of it,
                a 20x improvement over HTML, and the same runs used 26% to 60%
                fewer tokens. The map is worth more than the Markdown.
              </p>

              <h2 className="h-display font-bold text-2xl md:text-3xl">
                What a Blode.md deploy already does
              </h2>
              <p>
                Every deploy writes <code>llms.txt</code>,{" "}
                <code>llms-full.txt</code>, and a <code>.md</code> twin of every
                page from the same MDX as the HTML. Each twin opens with a
                blockquote that names the HTML page and the index before the
                content starts, which is the exact shape that scored 0.11 in the
                benchmark. The <code>Link</code> header on every HTML page
                advertises the index and the page&apos;s Markdown alternate, so
                an agent learns the routes exist from the first response.
                Nothing is hand-authored, so nothing drifts from the commit.
              </p>
              <p>
                The report also puts numbers on the drift. Only 24% of teams get
                a product change into their docs the same day; 22% take a month
                or longer. An agent that reaches a stale page does not notice.
                It writes the old parameter into a codebase. Publishing from the
                merge that changed the product, through the GitHub App or{" "}
                <Link
                  className="underline underline-offset-4"
                  href="/docs/deployment/ci"
                >
                  a CI push
                </Link>
                , is the only fix that does not depend on someone remembering.
              </p>

              <h2 className="h-display font-bold text-2xl md:text-3xl">
                What is on you
              </h2>
              <p>
                Two things. First, give every page a one-sentence{" "}
                <code>description</code>. It becomes the page&apos;s line in{" "}
                <code>llms.txt</code>, and that line is how an agent decides
                which page to open. A page without one lists as a bare title.{" "}
                <code>blodemd validate</code> now warns when pages are missing
                it. Second, keep the changelog and migration notes inside the
                docs folder, because the index is where an agent looks when a
                parameter it was told about has gone.
              </p>
              <p>
                The full list of what ships and what you control is in{" "}
                <Link
                  className="underline underline-offset-4"
                  href="/docs/features/agent-readable-docs"
                >
                  Docs for agents
                </Link>
                .
              </p>

              <h2 className="h-display font-bold text-2xl md:text-3xl">
                What we do not do yet
              </h2>
              <p>
                We do not show you how many agents read your docs. PostHog on a
                docs site counts humans, because agents run no JavaScript, and
                we have not built the server-side count. Until we do, the honest
                number is no data, and if you need it you can put a proxy you
                can log in front of the docs and count requests for{" "}
                <code>.md</code>, <code>llms.txt</code>, and the AI user agents.
              </p>

              <h2 className="h-display font-bold text-2xl md:text-3xl">
                Try it
              </h2>
              <p>
                Sign in with GitHub and push. The merge publishes the site and
                the Markdown agents read from that commit.
              </p>
              <div className="not-typeset mt-6 flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <SignupLink location="blog_agents_majority">
                    Connect GitHub
                    <ArrowRightIcon data-icon="inline-end" />
                  </SignupLink>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/docs/features/agent-readable-docs">
                    Read Docs for agents
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
