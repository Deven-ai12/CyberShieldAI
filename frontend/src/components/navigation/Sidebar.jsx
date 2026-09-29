import {
  Activity,
  BellRing,
  Bot,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Radar,
  ShieldCheck,
  Swords,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { label: 'Banking', path: '/banking', icon: LayoutDashboard },
  { label: 'Live Monitor', path: '/monitor', icon: Activity },
  { label: 'Transfer', path: '/transactions', icon: CreditCard },
  { label: 'Admin SOC', path: '/admin', icon: Radar },
  { label: 'Simulation', path: '/simulation', icon: Swords },
  { label: 'Email Alerts', path: '/alerts', icon: BellRing },
];

function Sidebar({ open, onClose }) {
  const { logout } = useAuth();

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm transition lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-slate-800/70 bg-slate-950/86 p-4 backdrop-blur-2xl transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="rounded-2xl border border-cyanGlow/40 bg-cyanGlow/10 p-2 text-cyanGlow shadow-neon">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-black uppercase text-white">NeuroShield</p>
              <p className="text-xs font-semibold text-slate-500">Sentinel AI</p>
            </div>
          </NavLink>
          <button
            type="button"
            className="rounded-xl border border-slate-700 p-2 text-slate-300 lg:hidden"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                  isActive
                    ? 'border-cyanGlow/45 bg-cyanGlow/10 text-cyan-100 shadow-neon'
                    : 'border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-900/70 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-redGlow/30 bg-redGlow/10 p-4">
          <div className="flex items-center gap-3 text-red-100">
            <Bot className="h-5 w-5" />
            <div>
              <p className="text-sm font-black">AI Shield Active</p>
              <p className="text-xs text-slate-400">Behavior stream online</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/80 px-3 py-2 text-sm font-bold text-slate-300 transition hover:border-redGlow/40 hover:text-red-100"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
