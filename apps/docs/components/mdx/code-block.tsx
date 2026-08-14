import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { CopyCodeButton } from "./copy-code-button";
import { getTextContent } from "./get-text-content";

export const CodeBlock = ({
  children,
  className,
  style,
  tabIndex,
  ...props
}: ComponentPropsWithoutRef<"pre"> & {
  children: ReactNode;
}) => {
  const code = getTextContent(children);
  const preStyle = style ? { ...style } : undefined;
  if (preStyle) {
    delete preStyle.backgroundColor;
  }

  return (
    <figure data-rehype-pretty-code-figure="">
      <pre
        className={cn(
          "no-scrollbar min-w-0 overflow-x-auto overflow-y-auto overscroll-y-auto overscroll-x-contain py-3.5 pr-14 pl-4 outline-none has-[[data-highlighted-line]]:pl-0 has-[[data-line-numbers]]:pl-0 has-[[data-slot=tabs]]:p-0",
          className
        )}
        style={preStyle}
        tabIndex={tabIndex ?? 0}
        {...props}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-[9] w-16 bg-gradient-to-r from-transparent to-code print:hidden"
          data-slot="fade-overlay"
        />
        <CopyCodeButton code={code} />
        {children}
      </pre>
    </figure>
  );
};
