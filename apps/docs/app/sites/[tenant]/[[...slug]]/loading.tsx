import { cn } from "@/lib/utils";

const Pulse = ({ className }: { className: string }) => (
  <div className={cn("animate-pulse rounded-md bg-muted", className)} />
);

export default function DocPageLoading() {
  return (
    <div className="flex min-h-svh flex-col">
      <div className="h-16 shrink-0 border-b border-border" />
      <div className="flex flex-1">
        <div className="hidden w-56 shrink-0 border-r border-border lg:block" />
        <div className="mx-auto flex w-full max-w-[40rem] flex-col gap-4 px-4 py-8">
          <Pulse className="h-8 w-2/3" />
          <Pulse className="h-4 w-full" />
          <Pulse className="h-4 w-5/6" />
          <Pulse className="mt-4 h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
