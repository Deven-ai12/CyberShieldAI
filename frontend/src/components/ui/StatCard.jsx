import GlassCard from './GlassCard.jsx';

function StatCard({ icon: Icon, label, value, delta, tone = 'cyan', footer, delay = 0 }) {
  const toneClass = {
    cyan: 'text-cyanGlow bg-cyanGlow/10 border-cyanGlow/30',
    red: 'text-redGlow bg-redGlow/10 border-redGlow/30',
    emerald: 'text-successGlow bg-successGlow/10 border-successGlow/30',
    amber: 'text-warningGlow bg-warningGlow/10 border-warningGlow/30',
  }[tone];

  return (
    <GlassCard className="p-5" delay={delay}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-black tracking-normal text-white sm:text-3xl">{value}</p>
        </div>
        {Icon ? (
          <div className={`rounded-xl border p-3 ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 text-sm">
        <span className="font-bold text-cyan-100">{delta}</span>
        <span className="text-slate-500">{footer}</span>
      </div>
    </GlassCard>
  );
}

export default StatCard;
