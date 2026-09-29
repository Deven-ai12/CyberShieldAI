const styles = {
  low: 'border-successGlow/30 bg-successGlow/10 text-emerald-200',
  medium: 'border-warningGlow/35 bg-warningGlow/10 text-amber-200',
  high: 'border-orange-400/35 bg-orange-500/10 text-orange-200',
  critical: 'border-redGlow/45 bg-redGlow/10 text-red-200 shadow-danger',
};

function SeverityBadge({ severity = 'medium', children }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black uppercase ${styles[severity] || styles.medium}`}>
      {children || severity}
    </span>
  );
}

export default SeverityBadge;
