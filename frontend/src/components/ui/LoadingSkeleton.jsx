function LoadingSkeleton({ rows = 4 }) {
  return (
    <div className="w-full space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-2xl border border-slate-800/70 bg-slate-900/60"
          style={{ width: `${100 - (index % 3) * 12}%` }}
        />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
