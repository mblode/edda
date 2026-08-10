export interface EducationalResource {
  description: string;
  path: string;
  publishedAt: string;
  slug: string;
  title: string;
  updatedAt: string;
}

/**
 * Registry for `/free-online-*-resources` educational pages.
 * Add a new entry here when you ship another resource page + markdown mirror.
 */
export const educationalResources: EducationalResource[] = [
  {
    description:
      "What llms.txt is, why sites add it for LLM-friendly docs, how to write one, and free tools and references for the emerging standard.",
    path: "/free-online-llms-txt-resources",
    publishedAt: "2026-08-10",
    slug: "free-online-llms-txt-resources",
    title: "Free online llms.txt resources",
    updatedAt: "2026-08-10",
  },
];

export const getEducationalResource = (slug: string) =>
  educationalResources.find((resource) => resource.slug === slug);
