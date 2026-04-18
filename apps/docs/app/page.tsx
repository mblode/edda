import {
  ArrowRightIcon,
  BookIcon,
  CodeIcon,
  GithubIcon,
  LayersTwoIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  WorldIcon,
} from "blode-icons-react";
import LockIcon from "blode-icons-react/icons/lock";
import RocketIcon from "blode-icons-react/icons/rocket";
import { cookies } from "next/headers";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { Separator } from "@/components/ui/separator";
import { SiteFooter } from "@/components/ui/site-footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { siteConfig } from "@/lib/config";
import { createSupabaseServerClient } from "@/lib/supabase";

const landingTheme = {
  "--primary": "#EFEE77",
  "--primary-foreground": "#000000",
  "--ring": "#EFEE77",
  "--selection": "#EFEE77",
  "--selection-foreground": "#000000",
} as CSSProperties;

const features = [
  {
    Icon: GithubIcon,
    description: "Every push to main ships a new version. No CI to maintain.",
    title: "Git-native deploys",
  },
  {
    Icon: WorldIcon,
    description: "Bring your domain. SSL handled. Proxy at yourdomain.com/docs.",
    title: "Custom domains",
  },
  {
    Icon: CodeIcon,
    description:
      "Beautiful docs out of the box with 30+ MDX components. No design work needed.",
    title: "Rich components",
  },
  {
    Icon: MagnifyingGlassIcon,
    description: "Instant full-text search across every page. Zero setup.",
    title: "Built-in search",
  },
  {
    Icon: LayersTwoIcon,
    description: "Docs, blogs, changelogs, and courses in one project.",
    title: "One workspace",
  },
  {
    Icon: BookIcon,
    description: "Point at an OpenAPI spec, ship an interactive reference.",
    title: "API reference",
  },
];

const pillars = [
  {
    Icon: RocketIcon,
    description:
      "Sub-second page loads on the edge. Incremental builds that finish before CI does.",
    title: "Built for speed",
  },
  {
    Icon: LockIcon,
    description:
      "SSO-ready, SSL by default, and a hardened preview environment for every pull request.",
    title: "Secure by default",
  },
  {
    Icon: SparklesIcon,
    description:
      "AI-ready output with llms.txt, clean semantic HTML, and structured data your users and LLMs can parse.",
    title: "Made for humans and AI",
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

const getDashboardHref = async (): Promise<string> => {
  try {
    const cookieStore = await cookies();
    const supabase = createSupabaseServerClient(cookieStore);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session ? "/app" : "/oauth/consent";
  } catch {
    return "/oauth/consent";
  }
};

export default async function HomePage() {
  const dashboardHref = await getDashboardHref();
  const isSignedIn = dashboardHref === "/app";

  return (
    <div
      className="min-h-screen overflow-x-clip bg-background text-foreground"
      style={landingTheme}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>

      <header className="container flex items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold tracking-tight">
            blode.md
          </span>
        </div>
        <nav aria-label="Main" className="flex items-center gap-1">
          <Button asChild size="sm" variant="ghost">
            <a
              href={siteConfig.links.github}
              rel="noopener noreferrer"
              target="_blank"
            >
              <GithubIcon data-icon="inline-start" />
              GitHub
            </a>
          </Button>
          <Button asChild size="sm" variant="ghost">
            <Link href="/docs">Docs</Link>
          </Button>
          <Separator className="mx-1 h-5" orientation="vertical" />
          <Button asChild size="sm" variant="ghost">
            <Link href={dashboardHref}>
              {isSignedIn ? "Dashboard" : "Sign in"}
            </Link>
          </Button>
          <ThemeToggle />
        </nav>
      </header>

      <main id="main">
        <section className="pb-24 pt-20 md:pb-32 md:pt-28 lg:pt-36">
          <div className="container">
            <Badge className="mb-8 gap-1.5" variant="secondary">
              <SparklesIcon />
              Built for humans and AI
            </Badge>
            <h1 className="h-display max-w-4xl text-balance text-5xl font-bold md:text-7xl lg:text-8xl">
              Docs should ship like code
            </h1>
            <p className="measure mt-6 text-balance text-lg text-muted-foreground md:text-xl">
              blode.md keeps your docs in git. Versioned, reviewed in pull
              requests, and deployed on every push. One project, one domain,
              one price.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={dashboardHref}>
                  {isSignedIn ? "Open dashboard" : "Start now"}
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs">Read the docs</Link>
              </Button>
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
                <Badge className="mb-4" variant="outline">
                  How it works
                </Badge>
                <h2 className="h-display text-balance text-3xl font-bold md:text-4xl">
                  From git to live docs
                </h2>
                <p className="measure mt-4 text-muted-foreground">
                  Point us at a repo from the browser or the terminal. We
                  handle the MDX build, search, domain, and every deploy after
                  that.
                </p>
              </div>
              <Tabs className="min-w-0" defaultValue="github">
                <TabsList>
                  <TabsTrigger value="github">
                    <GithubIcon data-icon="inline-start" />
                    GitHub
                  </TabsTrigger>
                  <TabsTrigger value="cli">
                    <CodeIcon data-icon="inline-start" />
                    CLI
                  </TabsTrigger>
                </TabsList>

                <TabsContent className="mt-6 min-w-0" value="github">
                  <div className="overflow-hidden rounded-xl bg-surface p-6 font-mono text-sm md:p-8">
                    <ol className="space-y-4">
                      <li className="flex gap-3">
                        <span className="text-muted-foreground">1.</span>
                        <span>
                          Install the GitHub app at{" "}
                          <span className="text-foreground">
                            github.com/apps/blodemd
                          </span>
                        </span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-muted-foreground">2.</span>
                        <span>Pick a repo and a docs folder</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="text-muted-foreground">3.</span>
                        <span>
                          Push to <span className="text-foreground">main</span>.
                          Deployed to{" "}
                          <span className="text-foreground">acme.blode.md</span>
                        </span>
                      </li>
                    </ol>
                  </div>
                </TabsContent>

                <TabsContent className="mt-6 min-w-0" value="cli">
                  <div className="relative overflow-hidden rounded-xl bg-surface p-6 font-mono text-sm md:p-8">
                    <CopyButton
                      className="absolute right-3 top-3 text-muted-foreground"
                      content={`blodemd login\nblodemd new docs\nblodemd push docs`}
                      size="sm"
                      variant="ghost"
                    />
                    <div className="space-y-6">
                      <div>
                        <p className="text-muted-foreground">
                          # browser sign-in with GitHub
                        </p>
                        <p>
                          <span className="text-muted-foreground">$</span>{" "}
                          blodemd login
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">
                          # scaffold from your project root
                        </p>
                        <p>
                          <span className="text-muted-foreground">$</span>{" "}
                          blodemd new docs
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground"># ship it</p>
                        <p>
                          <span className="text-muted-foreground">$</span>{" "}
                          blodemd push docs
                        </p>
                      </div>
                      <p className="text-muted-foreground">
                        Deployed to acme.blode.md
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-24 md:py-32">
          <div className="container">
            <div className="mb-12 max-w-2xl">
              <Badge className="mb-4" variant="outline">
                Features
              </Badge>
              <h2 className="h-display text-balance text-3xl font-bold md:text-4xl">
                Everything a modern docs site needs
              </h2>
              <p className="measure mt-4 text-muted-foreground">
                We handle the components, infrastructure, and workflow. You
                focus on the writing.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ Icon, title, description }) => (
                <Card className="justify-start p-2" key={title}>
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
            <div className="mb-12 max-w-2xl">
              <Badge className="mb-4" variant="outline">
                Built for teams
              </Badge>
              <h2 className="h-display text-balance text-3xl font-bold md:text-4xl">
                Enterprise-grade by default
              </h2>
              <p className="measure mt-4 text-muted-foreground">
                Fast, secure, and ready for your production traffic from day
                one.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pillars.map(({ Icon, title, description }) => (
                <Card className="justify-start p-2" key={title}>
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
                <Badge className="mb-4" variant="outline">
                  On your domain
                </Badge>
                <h2 className="h-display text-balance text-3xl font-bold md:text-4xl">
                  Docs on your own domain
                </h2>
                <p className="measure mt-4 text-muted-foreground">
                  Proxy /docs through your marketing site so blode.md never
                  feels like a detour. Ready-made configs for Vercel,
                  Cloudflare, Nginx, and Caddy.
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
                        className="absolute right-3 top-3 text-muted-foreground"
                        content={snippet}
                        size="sm"
                        variant="ghost"
                      />
                      <pre className="overflow-x-auto rounded-xl bg-surface p-6 font-mono text-sm md:p-8">
                        {snippet}
                      </pre>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </section>

        <section className="border-t border-border py-24 md:py-32">
          <div className="container" id="get-started">
            <Badge className="mb-4" variant="outline">
              Get started
            </Badge>
            <h2 className="h-display max-w-3xl text-balance text-3xl font-bold md:text-4xl">
              Ship docs as fast as you ship code
            </h2>
            <p className="measure mt-4 text-muted-foreground">
              Sign in with GitHub, pick a template, and ship your first site
              in under a minute.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href={dashboardHref}>
                  {isSignedIn ? "Open dashboard" : "Start now"}
                  <ArrowRightIcon data-icon="inline-end" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs">Read the docs</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
