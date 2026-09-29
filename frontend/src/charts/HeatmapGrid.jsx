const labels = ['NA', 'EU', 'APAC', 'IN', 'LATAM', 'MEA'];

function HeatmapGrid() {
  const cells = Array.from({ length: 48 }).map((_, index) => {
    const intensity = Math.round(24 + Math.abs(Math.sin(index * 1.7)) * 76);
    const hot = intensity > 78;
    return { id: index, intensity, hot };
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {labels.map((label) => (
          <span key={label} className="rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-xs font-bold text-slate-400">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-8 gap-2">
        {cells.map((cell) => (
          <div
            key={cell.id}
            className="aspect-square rounded-lg border transition hover:scale-105"
            title={`Threat density ${cell.intensity}%`}
            style={{
              backgroundColor: cell.hot ? `rgba(255, 63, 95, ${cell.intensity / 135})` : `rgba(16, 217, 255, ${cell.intensity / 180})`,
              borderColor: cell.hot ? 'rgba(255,63,95,0.42)' : 'rgba(16,217,255,0.26)',
              boxShadow: cell.hot ? '0 0 16px rgba(255,63,95,0.24)' : '0 0 12px rgba(16,217,255,0.16)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default HeatmapGrid;
