import type { Deployment } from "@repo/contracts";

import { cn } from "@/lib/utils";

const STATUS_DOT: Record<Deployment["status"], string> = {
  Building: "bg-yellow-500",
  Failed: "bg-red-500",
  Queued: "bg-muted-foreground/60",
  Successful: "bg-emerald-500",
};

const STATUS_LABEL: Record<Deployment["status"], string> = {
  Building: "Building",
  Failed: "Failed",
  Queued: "Queued",
  Successful: "Ready",
};

export const StatusPill = ({
  status,
  className,
}: {
  status: Deployment["status"];
  className?: string;
}) => (
  <span
    className={cn(
      "inline-flex items-center gap-2 text-foreground text-sm",
      className
    )}
  >
    <span
      aria-hidden="true"
      className={cn("size-2 rounded-full", STATUS_DOT[status])}
    />
    {STATUS_LABEL[status]}
  </span>
);
