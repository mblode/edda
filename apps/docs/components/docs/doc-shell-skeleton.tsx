import { Skeleton } from "@/components/ui/skeleton";

const SIDEBAR_ROWS = [
  "w-3/4",
  "w-1/2",
  "w-2/3",
  "w-5/6",
  "w-1/2",
  "w-3/5",
  "w-3/4",
  "w-2/5",
];

const BODY_ROWS = [
  "w-full",
  "w-11/12",
  "w-full",
  "w-4/5",
  "w-full",
  "w-2/3",
  "w-full",
  "w-3/4",
];

/**
 * Stands in for `DocShell` while the tenant's page streams in. Everything a
 * docs page renders comes from the request (the tenant header and the slug), so
 * none of it can prerender. This is the frame that does, and it holds the
 * layout steady so the real shell does not shift when it lands.
 */
export const DocShellSkeleton = () => (
  <div aria-busy="true" aria-live="polite" className="flex min-h-svh flex-col">
    <span className="sr-only">Loading documentation</span>
    <div className="flex h-(--header-height) shrink-0 items-center gap-4 border-b px-4">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="ml-auto h-8 w-56 max-w-[40vw]" />
    </div>
    <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8">
      <div className="hidden w-56 shrink-0 flex-col gap-3 lg:flex">
        {SIDEBAR_ROWS.map((width) => (
          <Skeleton className={`h-4 ${width}`} key={width} />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <Skeleton className="h-9 w-2/3 max-w-[24rem]" />
        <div className="flex flex-col gap-3">
          {BODY_ROWS.map((width) => (
            <Skeleton className={`h-4 ${width}`} key={width} />
          ))}
        </div>
      </div>
      <div className="hidden w-48 shrink-0 flex-col gap-3 xl:flex">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  </div>
);
