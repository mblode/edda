const GRID_KEYS = ["a", "b", "c", "d", "e", "f"] as const;

export default function AppLoading() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="h-8 w-36 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-28 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GRID_KEYS.map((key) => (
          <div
            className="h-28 animate-pulse rounded-xl border border-border bg-card"
            key={key}
          />
        ))}
      </div>
    </div>
  );
}
