import CheckCircleIcon from "blode-icons-react/icons/check-circle-2";
import InfoIcon from "blode-icons-react/icons/circle-info";
import ExclamationCircleIcon from "blode-icons-react/icons/exclamation-circle";
import LightbulbIcon from "blode-icons-react/icons/lightbulb";
import NoteIcon from "blode-icons-react/icons/note-text";
import SparkleIcon from "blode-icons-react/icons/sparkle-2";
import TriangleExclamationIcon from "blode-icons-react/icons/triangle-exclamation";
import type { ComponentType, ReactNode, SVGProps } from "react";

import { cn } from "@/lib/utils";

type CalloutType =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "note"
  | "tip"
  | "check";

// Hue carries the tone and the icon carries the nuance: `info`/`tip` and
// `check`/`success` are near-synonyms kept for authoring compatibility, so
// giving each pair one colour and two icons keeps them legible without
// inventing a sixth hue nobody can name.
const variantStyles: Record<CalloutType, string> = {
  check:
    "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
  danger: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40",
  info: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
  note: "border-border bg-muted/60",
  success:
    "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40",
  tip: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40",
  warning:
    "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40",
};

const iconStyles: Record<CalloutType, string> = {
  check: "text-emerald-600 dark:text-emerald-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  note: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  tip: "text-blue-600 dark:text-blue-400",
  warning: "text-amber-600 dark:text-amber-500",
};

const variantIcons: Record<
  CalloutType,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  check: CheckCircleIcon,
  danger: ExclamationCircleIcon,
  info: InfoIcon,
  note: NoteIcon,
  success: SparkleIcon,
  tip: LightbulbIcon,
  warning: TriangleExclamationIcon,
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  icon?: ReactNode;
  color?: string;
  children: ReactNode;
}

export const Callout = ({
  type = "info",
  title,
  icon,
  color,
  children,
}: CalloutProps) => {
  const DefaultIcon = variantIcons[type] ?? variantIcons.info;

  return (
    <div
      data-slot="alert"
      data-typeset-block=""
      role="alert"
      data-variant="default"
      className={cn(
        "relative grid grid-cols-[calc(var(--spacing)*4)_1fr] items-start gap-x-3 gap-y-0.5 rounded-xl border px-4 py-3 text-sm text-surface-foreground",
        "[&>svg]:size-4 [&>svg]:translate-y-0.5",
        "**:[code]:border md:-mx-1",
        variantStyles[type]
      )}
      style={
        color
          ? {
              backgroundColor: `${color}10`,
              borderColor: color,
            }
          : undefined
      }
    >
      {icon ?? (
        <DefaultIcon
          aria-hidden
          className={color ? undefined : iconStyles[type]}
          style={color ? { color } : undefined}
        />
      )}
      <div
        data-slot="alert-description"
        className="col-start-2 grid justify-items-start gap-1 text-sm text-foreground [&_p]:leading-relaxed"
      >
        {title ? <strong className="font-medium">{title}</strong> : null}
        <div className="text-sm [&>p:first-child]:mt-0 [&>p:last-child]:mb-0 [&_p]:leading-relaxed [&_p:not(:first-child)]:mt-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Note = ({ children }: { children: ReactNode }) => (
  <Callout type="note">{children}</Callout>
);

export const Warning = ({ children }: { children: ReactNode }) => (
  <Callout type="warning">{children}</Callout>
);

export const Info = ({ children }: { children: ReactNode }) => (
  <Callout type="info">{children}</Callout>
);

export const Tip = ({ children }: { children: ReactNode }) => (
  <Callout type="tip">{children}</Callout>
);

export const Check = ({ children }: { children: ReactNode }) => (
  <Callout type="check">{children}</Callout>
);

export const Danger = ({ children }: { children: ReactNode }) => (
  <Callout type="danger">{children}</Callout>
);
