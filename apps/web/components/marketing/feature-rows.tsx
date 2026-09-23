import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FeatureRowsProps {
  items: { description: string; media: ReactNode; title: string }[];
}

/** Local mirror of `@blode/feature-rows`: alternating text and product media, no cards. */
export const FeatureRows = ({ items }: FeatureRowsProps) => (
  <ol className="flex flex-col gap-16 md:gap-24">
    {items.map((item, index) => (
      <li
        className="grid items-center gap-6 md:grid-cols-2 md:gap-16"
        key={item.title}
      >
        <div className={cn("min-w-0", index % 2 === 1 && "md:order-2")}>
          <h3 className="h-title text-balance font-semibold text-2xl md:text-3xl">
            {item.title}
          </h3>
          <p className="measure mt-3 text-muted-foreground md:text-lg">
            {item.description}
          </p>
        </div>
        <div className="min-w-0">{item.media}</div>
      </li>
    ))}
  </ol>
);
