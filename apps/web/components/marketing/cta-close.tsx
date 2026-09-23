import type { ReactNode } from "react";

interface CtaCloseProps {
  action: ReactNode;
  command?: ReactNode;
  description?: string;
  /** `data-section` id for `section_viewed`. */
  section?: string;
  title: string;
}

/** Local mirror of `@blode/cta-close`: the final action, plus the command. */
export const CtaClose = ({
  action,
  command,
  description,
  section,
  title,
}: CtaCloseProps) => (
  <section
    className="border-border border-t py-24 md:py-32"
    data-section={section}
  >
    <div className="container flex flex-col items-center text-center">
      <h2 className="h-title max-w-3xl text-balance font-semibold text-3xl md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="measure mt-4 text-balance text-muted-foreground md:text-lg">
          {description}
        </p>
      ) : null}
      <div className="mt-8">{action}</div>
      {command ? (
        <div className="mt-10 w-full max-w-xl text-left">{command}</div>
      ) : null}
    </div>
  </section>
);
