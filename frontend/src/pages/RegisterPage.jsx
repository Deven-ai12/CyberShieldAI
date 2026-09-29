import { motion } from 'framer-motion';
import { ArrowRight, Building2, KeyRound, Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getDeviceProfile } from '../utils/device.js';

function RegisterPage() {
  const navigate = useNavigate();
  const { register, authError } = useAuth();
  const device = useMemo(() => getDeviceProfile(), []);
  const [form, setForm] = useState({
    fullName: 'Aarav Mehta',
    email: 'aarav.mehta@neurobank.ai',
    password: 'Secure@1234',
    accountTier: 'Private Banking',
    role: 'USER',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (form.fullName.trim().length < 2) nextErrors.fullName = 'Full name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email';
    if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        accountTier: form.accountTier,
        role: form.role,
      });
      const pendingEmail = response?.email || form.email;
      sessionStorage.setItem('securetrace.pendingVerificationEmail', pendingEmail);
      navigate('/verify-email', {
        replace: true,
        state: {
          email: pendingEmail,
          message: response?.message || 'OTP sent to your email. Verify to activate the account.',
          expiresAt: response?.expiresAt,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative z-10 grid min-h-screen place-items-center px-4 py-8">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[0.9fr_1fr]">
        <section className="flex flex-col justify-center">
          <Link to="/" className="mb-8 flex items-center gap-3">
            <div className="rounded-2xl border border-cyanGlow/45 bg-cyanGlow/10 p-2 text-cyanGlow shadow-neon">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="font-black uppercase text-white">NeuroShield Bank</p>
              <p className="text-xs font-semibold text-slate-500">Zero-trust onboarding</p>
            </div>
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-black uppercase text-successGlow">Secure registration</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-6xl">Create a protected banking identity.</h1>
            <p className="mt-5 max-w-2xl leading-8 text-slate-400">
              Registration creates a pending user, hashes the password, sends an email OTP through Brevo, and activates banking access only after verification.
            </p>
          </motion.div>
          <div className="mt-8 rounded-2xl border border-cyanGlow/25 bg-cyanGlow/10 p-4">
            <p className="text-sm font-black text-cyan-100">Device binding preview</p>
            <p className="mt-2 font-mono text-xs text-slate-400">{device.fingerprint}</p>
            <p className="mt-1 text-xs text-slate-500">{device.platform} · {device.browser} · {device.timezone}</p>
          </div>
        </section>

        <GlassCard className="p-6 sm:p-8" glow>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-cyanGlow">New user module</p>
              <h2 className="mt-1 text-2xl font-black text-white">Register account</h2>
            </div>
            <div className="rounded-2xl border border-successGlow/35 bg-successGlow/10 p-3 text-successGlow">
              <UserRound className="h-6 w-6" />
            </div>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="label-cyber" htmlFor="fullName">Full name</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input id="fullName" className="input-cyber pl-11" value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} />
              </div>
              {errors.fullName ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.fullName}</p> : null}
            </div>

            <div>
              <label className="label-cyber" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="email"
                  className="input-cyber pl-11"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(event) => updateField('email', event.target.value)}
                />
              </div>
              {errors.email ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.email}</p> : null}
            </div>

            <div>
              <label className="label-cyber" htmlFor="password">Password</label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input id="password" className="input-cyber pl-11" type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} />
              </div>
              {errors.password ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.password}</p> : null}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="label-cyber" htmlFor="accountTier">Account tier</label>
                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <select id="accountTier" className="input-cyber pl-11" value={form.accountTier} onChange={(event) => updateField('accountTier', event.target.value)}>
                    <option>Private Banking</option>
                    <option>Retail Banking</option>
                    <option>Fintech Operator</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-cyber" htmlFor="role">Role</label>
                <select id="role" className="input-cyber" value={form.role} onChange={(event) => updateField('role', event.target.value)}>
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin Analyst</option>
                </select>
              </div>
            </div>

            {authError ? <p className="rounded-xl border border-redGlow/35 bg-redGlow/10 p-3 text-sm font-semibold text-red-200">{authError}</p> : null}

            <NeonButton type="submit" icon={ArrowRight} className="w-full" disabled={loading}>
              {loading ? 'Sending verification OTP' : 'Create Account & Send OTP'}
            </NeonButton>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-black text-cyan-100 transition hover:text-cyanGlow">
              Sign in
            </Link>
          </p>
        </GlassCard>
      </div>
    </main>
  );
}

export default RegisterPage;
