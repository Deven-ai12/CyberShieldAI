import { CheckCircle2, CircleAlert, ShieldCheck } from 'lucide-react';

const iconMap = {
  trusted: ShieldCheck,
  watch: CircleAlert,
  review: CheckCircle2,
};

function SessionTimeline({ events }) {
  return (
    <div className="space-y-3">
      {events.map((event, index) => {
        const Icon = iconMap[event.status] || ShieldCheck;
        const color = event.status === 'trusted' ? 'text-successGlow' : event.status === 'watch' ? 'text-warningGlow' : 'text-redGlow';
        return (
          <div key={`${event.label}-${event.time}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className={`rounded-full border border-current bg-slate-950 p-1.5 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              {index < events.length - 1 ? <div className="h-8 w-px bg-slate-800" /> : null}
            </div>
            <div className="min-w-0 pb-2">
              <p className="text-sm font-black text-white">{event.label}</p>
              <p className="text-xs text-slate-500">{event.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default SessionTimeline;
