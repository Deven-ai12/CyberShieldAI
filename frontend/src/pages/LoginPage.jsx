import { motion } from 'framer-motion';
import { Activity, ArrowRight, Fingerprint, KeyRound, LockKeyhole, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { getDeviceProfile } from '../utils/device.js';
import { formatShortDate } from '../utils/format.js';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, authError } = useAuth();
  const { liveMetrics } = useSecurity();
  const device = useMemo(() => getDeviceProfile(), []);
  const [form, setForm] = useState({ email: 'analyst@neuroshield.ai', password: 'Secure@1234' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid banking email';
    if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      navigate(location.state?.from || '/banking', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 grid min-h-screen place-items-center px-4 py-8">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <section className="flex flex-col justify-center">
          <Link to="/" className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl border border-cyanGlow/45 bg-cyanGlow/10 p-2 text-cyanGlow shadow-neon">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black uppercase text-white">NeuroShield Bank</p>
              <p className="text-xs font-semibold text-slate-500">Protected login perimeter</p>
            </div>
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-black uppercase text-successGlow">Adaptive authentication</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-6xl">Banking access guarded by behavior AI.</h1>
            <p className="mt-5 max-w-2xl leading-8 text-slate-400">
              Device trust, typing rhythm, mouse movement, clipboard behavior, and tab switching are monitored from the first keystroke.
            </p>
          </motion.div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <Fingerprint className="h-6 w-6 text-cyanGlow" />
                <div>
                  <p className="text-sm font-black text-white">Device fingerprint</p>
                  <p className="text-xs text-slate-500">{device.fingerprint}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-successGlow" />
                <div>
                  <p className="text-sm font-black text-white">Login activity</p>
                  <p className="text-xs text-slate-500">Typing {liveMetrics.typingSpeed} WPM · Clicks {liveMetrics.clickFrequency}/min</p>
                </div>
              </div>
            </GlassCard>
          </div>
        </section>

        <GlassCard className="p-6 sm:p-8" glow>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-cyanGlow">Secure banking login</p>
              <h2 className="mt-1 text-2xl font-black text-white">Identity checkpoint</h2>
            </div>
            <div className="rounded-2xl border border-successGlow/35 bg-successGlow/10 p-3 text-successGlow">
              <LockKeyhole className="h-6 w-6" />
            </div>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="label-cyber" htmlFor="email">Banking email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  className="input-cyber pl-11"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>
              {errors.email ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.email}</p> : null}
            </div>

            <div>
              <label className="label-cyber" htmlFor="password">Password</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="password"
                  className="input-cyber pl-11"
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                />
              </div>
              {errors.password ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.password}</p> : null}
            </div>

            {authError ? <p className="rounded-xl border border-redGlow/35 bg-redGlow/10 p-3 text-sm font-semibold text-red-200">{authError}</p> : null}

            <NeonButton type="submit" icon={ArrowRight} className="w-full" disabled={loading}>
              {loading ? 'Verifying session' : 'Enter Secure Banking'}
            </NeonButton>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            New protected user?{' '}
            <Link to="/register" className="font-black text-cyan-100 transition hover:text-cyanGlow">
              Create account
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-slate-500">
            Forgot password?{' '}
            <Link to="/forgot-password" className="font-black text-cyan-100 transition hover:text-cyanGlow">
              Reset with email OTP
            </Link>
          </p>

          <div className="mt-6 grid gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/50 p-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-5 w-5 text-cyanGlow" />
              <div>
                <p className="text-sm font-black text-white">{device.platform}</p>
                <p className="text-xs text-slate-500">{device.browser} · {device.screen}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-400">
              Last verified login: <span className="font-bold text-slate-200">{formatShortDate(new Date(Date.now() - 1000 * 60 * 44))}</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </main>
  );
}

export default LoginPage;
