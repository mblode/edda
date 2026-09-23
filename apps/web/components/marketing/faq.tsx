import type { FaqItem } from "@/lib/structured-data";
import { faqPageNode } from "@/lib/structured-data";

interface FaqProps {
  items: readonly FaqItem[];
}

/**
 * Local mirror of `@blode/faq`. Native `<details>` so it works without
 * hydration; `public/landing.js` reports `faq_opened` from the `data-faq`
 * attribute in place of an `onOpen` callback.
 */
export const Faq = ({ items }: FaqProps) => (
  <div className="flex flex-col divide-y divide-border border-border border-y">
    {items.map((item) => (
      <details className="group" data-faq={item.question} key={item.question}>
        <summary className="flex list-none items-center justify-between gap-6 rounded-md py-5 font-medium text-base outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-lg [&::-webkit-details-marker]:hidden">
          {item.question}
          <span
            aria-hidden="true"
            className="text-muted-foreground transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-open:rotate-45"
          >
            +
          </span>
        </summary>
        <p className="measure pb-6 text-muted-foreground">{item.answer}</p>
        {item.links ? (
          <ul className="-mt-2 flex flex-wrap gap-x-6 gap-y-2 pb-6 text-sm">
            {item.links.map((link) => (
              <li key={link.href}>
                <a
                  className="rounded-sm underline underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  href={link.href}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </details>
    ))}
  </div>
);

/** FAQPage JSON-LD from the same array the visible FAQ renders. */
export const faqJsonLd = (items: readonly FaqItem[], path = "/") =>
  faqPageNode(path, items);
