import { Home, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard.jsx';

function NotFoundPage() {
  return (
    <main className="relative z-10 grid min-h-screen place-items-center px-4">
      <GlassCard className="max-w-xl p-8 text-center">
        <ShieldAlert className="mx-auto h-12 w-12 text-redGlow" />
        <h1 className="mt-5 text-4xl font-black text-white">Route not authorized</h1>
        <p className="mt-3 text-slate-400">The requested console view is outside the current security perimeter.</p>
        <Link
          to="/"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyanGlow/45 bg-cyanGlow/10 px-4 py-2.5 text-sm font-black text-cyan-100 shadow-neon"
        >
          <Home className="h-4 w-4" />
          Back to command entry
        </Link>
      </GlassCard>
    </main>
  );
}

export default NotFoundPage;
