import { compileMDX } from "next-mdx-remote/rsc";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import prettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/components/mdx";

export const renderMdx = async (source: string) =>
  await compileMDX({
    components: mdxComponents,
    options: {
      mdxOptions: {
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: [
                  "ml-2 text-[0.9em] opacity-0 transition-opacity hover:opacity-100",
                ],
              },
            },
          ],
          [
            prettyCode,
            {
              keepBackground: false,
              theme: {
                dark: "github-dark",
                light: "github-light",
              },
            },
          ],
        ],
        remarkPlugins: [remarkGfm],
      },
      parseFrontmatter: true,
    },
    source,
  });
