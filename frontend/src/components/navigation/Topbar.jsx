import { Bell, Menu, RadioTower, Search, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSecurity } from '../../context/SecurityContext.jsx';
import RiskBadge from '../ui/RiskBadge.jsx';

function Topbar({ onMenuClick }) {
  const { user } = useAuth();
  const { riskScore, riskLevel, alerts } = useSecurity();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-800/70 bg-slate-950/70 backdrop-blur-2xl">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-xl border border-slate-700 p-2 text-slate-300 lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-slate-400 md:flex">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search sessions, devices, threats</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-successGlow/30 bg-successGlow/10 px-3 py-1.5 text-xs font-black text-emerald-200 sm:flex">
            <RadioTower className="h-4 w-4" />
            Live
          </div>
          <RiskBadge score={riskScore} level={riskLevel} />
          <button
            type="button"
            className="relative rounded-xl border border-slate-700/80 p-2 text-slate-300 transition hover:border-cyanGlow/40 hover:text-cyan-100"
            aria-label="Security notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-redGlow text-[10px] font-black text-white">
              {Math.min(alerts.length, 9)}
            </span>
          </button>
          <div className="hidden items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 px-3 py-2 md:flex">
            <div className="rounded-xl border border-cyanGlow/30 bg-cyanGlow/10 p-1.5 text-cyanGlow">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-black text-white">{user?.name || 'Security User'}</p>
              <p className="text-xs text-slate-500">{user?.accountTier || 'Protected Account'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
