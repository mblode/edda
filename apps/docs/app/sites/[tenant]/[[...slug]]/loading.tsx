// Segment hole for Instant Navigations. The shared `[[...slug]]` App Shell
// must not include a resolved article, or every sidebar click can keep the
// previous page while the URL updates. Keep this fallback invisible: a
// skeleton here flashes on every client navigation, including prefetch hits.
export default function DocPageLoading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="flex min-w-0 flex-1 flex-col"
    >
      <span className="sr-only">Loading documentation</span>
    </div>
  );
}
