import { Skeleton } from "@/components/ui/skeleton";

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

export const DocArticleBodySkeleton = () => (
  <div className="flex flex-col gap-3">
    {BODY_ROWS.map((width) => (
      <Skeleton className={`h-4 ${width}`} key={width} />
    ))}
  </div>
);

export const DocArticleSkeleton = () => (
  <div
    aria-busy="true"
    aria-live="polite"
    className="flex min-w-0 flex-1 flex-col"
  >
    <span className="sr-only">Loading documentation</span>
    <div className="h-(--top-spacing) shrink-0" />
    <div className="mx-auto flex w-full max-w-[40rem] flex-1 flex-col gap-6 px-4 py-6 md:px-0 lg:py-8">
      <Skeleton className="h-9 w-2/3 max-w-[24rem]" />
      <DocArticleBodySkeleton />
    </div>
  </div>
);
