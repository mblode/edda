import { ArrowRightIcon } from "blode-icons-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { MarketingShell } from "@/components/ui/marketing-shell";
import { RelativeTime } from "@/components/ui/relative-time";
import { blogPosts } from "@/lib/blog";
import { pageMetadata } from "@/lib/marketing-site";

export const metadata = pageMetadata({
  description:
    "Notes, deep dives, and product updates from the team building Blode.md, the terminal-native docs platform that ships documentation straight from your git repo.",
  path: "/blog",
  title: "Blog | Blode.md",
});

export default function BlogPage() {
  return (
    <MarketingShell>
      <section className="pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="container flex flex-col items-center text-center">
          <Badge className="mb-4" variant="outline">
            Blog
          </Badge>
          <h1 className="h-display max-w-3xl text-balance font-bold text-4xl md:text-6xl">
            Notes from the repo
          </h1>
          <p className="measure mt-6 text-balance text-lg text-muted-foreground md:text-xl">
            Updates, decisions, and ship notes from the team behind Blode.md.
          </p>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="container">
          <ul className="measure mx-auto flex flex-col divide-y divide-border">
            {blogPosts.map((post) => (
              <li key={post.slug}>
                <Link
                  className="group flex flex-col gap-3 py-8 first:pt-0"
                  href={`/blog/${post.slug}`}
                >
                  <RelativeTime
                    className="text-muted-foreground text-sm"
                    date={post.date}
                  />
                  <h2 className="h-display font-bold text-2xl decoration-foreground/40 underline-offset-4 transition-colors group-hover:underline md:text-3xl">
                    {post.title}
                  </h2>
                  <p className="text-muted-foreground">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-muted-foreground text-sm transition-colors group-hover:text-foreground">
                    Read post
                    <ArrowRightIcon data-icon="inline-end" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </MarketingShell>
  );
}
