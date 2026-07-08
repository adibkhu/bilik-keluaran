export default function FeedLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-surface-hover" />
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-40 animate-pulse rounded-xl border border-border bg-surface"
          />
        ))}
      </div>
    </div>
  );
}
