import { getRiskLevel } from '../../utils/risk.js';

function RiskBadge({ score, level, className = '' }) {
  const risk = level || getRiskLevel(score);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${className}`}
      style={{ color: risk.color, backgroundColor: risk.bg, borderColor: risk.border }}
    >
      <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: risk.color }} />
      {risk.label}
    </span>
  );
}

export default RiskBadge;
