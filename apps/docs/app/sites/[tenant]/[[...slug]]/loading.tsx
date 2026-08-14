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
