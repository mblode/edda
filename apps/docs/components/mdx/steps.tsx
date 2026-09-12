import type { ReactNode } from "react";
import { isValidElement } from "react";

import { cn } from "@/lib/utils";

interface StepProps {
  title: string;
  children?: ReactNode;
  icon?: ReactNode;
  stepNumber?: number;
  titleSize?: "p" | "h2" | "h3" | "h4";
  id?: string;
}

export const Step = ({
  title,
  children,
  icon,
  stepNumber,
  titleSize = "p",
  id,
}: StepProps) => {
  const TitleTag = titleSize === "p" ? "div" : titleSize;
  const anchorId = id ?? title.toLowerCase().replaceAll(/\s+/g, "-");

  return (
    <div className="relative pb-8 pl-8 sm:pl-10 last:pb-0" id={anchorId}>
      <div
        aria-hidden
        className="absolute left-0 flex size-7 items-center justify-center rounded-full border border-border bg-muted font-mono text-xs font-medium"
      >
        {icon ?? stepNumber ?? null}
      </div>
      <TitleTag
        className={cn(
          "font-semibold leading-7",
          titleSize === "h2" && "text-xl",
          titleSize === "h3" && "text-lg",
          titleSize === "h4" && "text-base",
          titleSize === "p" && "text-base"
        )}
      >
        {title}
      </TitleTag>
      {children ? (
        <div className="mt-2 text-sm text-muted-foreground">{children}</div>
      ) : null}
    </div>
  );
};

interface StepsProps {
  children: ReactNode;
  titleSize?: "p" | "h2" | "h3" | "h4";
}

export const Steps = ({ children, titleSize }: StepsProps) => {
  const items = Array.isArray(children) ? children : [children];

  const hasStepChildren = items.some(
    (child) => isValidElement(child) && child.type === Step
  );

  if (!hasStepChildren) {
    return (
      <div
        data-typeset-block=""
        className="steps [counter-reset:step] md:ml-4 md:border-l md:pl-8 [&>h3]:step"
      >
        {children}
      </div>
    );
  }

  // Built with a plain loop rather than `map` over a closure: the counter only
  // advances for real `Step` children, and keeping it out of a callback keeps
  // the numbering readable as a straight pass down the list.
  const numberedChildren: ReactNode[] = [];
  let counter = 0;
  for (const child of items) {
    if (isValidElement<StepProps>(child) && child.type === Step) {
      counter += 1;
      numberedChildren.push(
        <Step
          key={child.props.id ?? child.props.title}
          {...child.props}
          stepNumber={child.props.stepNumber ?? counter}
          titleSize={child.props.titleSize ?? titleSize}
        />
      );
      continue;
    }
    numberedChildren.push(child);
  }

  return (
    <div data-typeset-block="" className="border-l border-border pl-2">
      {numberedChildren}
    </div>
  );
};
