export interface BlogPost {
  date: string;
  excerpt: string;
  slug: string;
  title: string;
}

export const blogPosts: BlogPost[] = [
  {
    date: "2026-04-20",
    excerpt:
      "Why we built a docs platform that publishes from GitHub in three commands.",
    slug: "intro-to-blode-md",
    title: "Hello, Blode.md",
  },
];
