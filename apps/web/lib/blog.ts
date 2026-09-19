export interface BlogPost {
  date: string;
  excerpt: string;
  slug: string;
  title: string;
}

export const blogPosts: BlogPost[] = [
  {
    date: "2026-09-19",
    excerpt:
      "Mintlify's 2026 State of Knowledge Report puts agents at 66% of docs traffic and a link to llms.txt at 20x fewer failed requests. What that means for docs in git.",
    slug: "agents-are-the-majority-reader",
    title: "Agents are the majority reader now",
  },
  {
    date: "2026-04-20",
    excerpt:
      "Why we built a docs platform that publishes from GitHub in three commands.",
    slug: "intro-to-blode-md",
    title: "Hello, Blode.md",
  },
];
