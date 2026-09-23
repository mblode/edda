import type { ReactNode } from "react";

interface MarketingHeroProps {
  action: ReactNode;
  children?: ReactNode;
  description: string;
  eyebrow?: ReactNode;
  secondary?: ReactNode;
  title: string;
}

/**
 * Local mirror of `@blode/marketing-hero`. Renders in its final state on first
 * paint: nothing in the hero animates.
 */
export const MarketingHero = ({
  action,
  children,
  description,
  eyebrow,
  secondary,
  title,
}: MarketingHeroProps) => (
  <section className="pt-[calc(var(--header-height)+2.5rem)] pb-16 md:pt-[calc(var(--header-height)+5rem)] md:pb-24">
    <div className="container flex flex-col items-center text-center">
      {eyebrow ? <div className="mb-6">{eyebrow}</div> : null}
      <h1 className="h-display max-w-4xl text-balance font-semibold text-5xl sm:text-6xl md:text-7xl">
        {title}
      </h1>
      <p className="mt-6 max-w-xl text-balance text-base text-muted-foreground md:text-lg">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        {action}
        {secondary}
      </div>
    </div>
    {children ? <div className="mt-14 md:mt-20">{children}</div> : null}
  </section>
);
