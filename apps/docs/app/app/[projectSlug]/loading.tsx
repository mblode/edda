const TAB_KEYS = ["overview", "deployments", "domains", "git", "settings"];

export default function ProjectLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="h-6 w-40 animate-pulse rounded-full bg-muted" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TAB_KEYS.map((key) => (
          <div
            className="my-1 h-7 w-24 animate-pulse rounded bg-muted"
            key={key}
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-32 animate-pulse rounded-xl border border-border bg-card lg:col-span-2" />
        <div className="h-32 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-40 animate-pulse rounded-xl border border-border bg-card lg:col-span-2" />
        <div className="h-40 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </div>
  );
}
