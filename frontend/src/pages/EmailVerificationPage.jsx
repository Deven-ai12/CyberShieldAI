import { motion } from 'framer-motion';
import { ArrowRight, Mail, RotateCcw, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getDeviceProfile } from '../utils/device.js';

function readPendingEmail(location) {
  const queryEmail = new URLSearchParams(location.search).get('email');
  return (
    location.state?.email ||
    queryEmail ||
    sessionStorage.getItem('securetrace.pendingVerificationEmail') ||
    ''
  );
}

function EmailVerificationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmailOtp, resendEmailOtp, authError } = useAuth();
  const device = useMemo(() => getDeviceProfile(), []);
  const [email, setEmail] = useState(() => readPendingEmail(location));
  const [otp, setOtp] = useState('');
  const [statusMessage, setStatusMessage] = useState(
    location.state?.message || 'Enter the 6 digit OTP sent to your email to activate this account.',
  );
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const cleanEmail = email.trim();

  const validateEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

  const onVerifyOtp = async (event) => {
    event.preventDefault();
    const cleanOtp = otp.trim();
    const nextErrors = {};
    if (!validateEmail()) nextErrors.email = 'Enter the email used during registration';
    if (!/^\d{6}$/.test(cleanOtp)) nextErrors.otp = 'Enter the 6 digit OTP sent to your email';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await verifyEmailOtp({ email: cleanEmail, otp: cleanOtp });
      sessionStorage.removeItem('securetrace.pendingVerificationEmail');
      navigate('/banking', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const onResendOtp = async () => {
    if (!validateEmail()) {
      setErrors({ email: 'Enter the email used during registration before resending OTP' });
      return;
    }
    setErrors({});
    setResending(true);
    try {
      const response = await resendEmailOtp(cleanEmail);
      sessionStorage.setItem('securetrace.pendingVerificationEmail', cleanEmail);
      setStatusMessage(response?.message || 'A fresh OTP was sent to your email.');
    } finally {
      setResending(false);
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
              <p className="text-xs font-semibold text-slate-500">Email trust verification</p>
            </div>
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-black uppercase text-successGlow">OTP verification</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-6xl">Activate the banking identity.</h1>
            <p className="mt-5 max-w-2xl leading-8 text-slate-400">
              This step confirms mailbox ownership before the backend activates the user and issues the first JWT session.
            </p>
          </motion.div>
          <div className="mt-8 rounded-2xl border border-cyanGlow/25 bg-cyanGlow/10 p-4">
            <p className="text-sm font-black text-cyan-100">Trusted device handshake</p>
            <p className="mt-2 font-mono text-xs text-slate-400">{device.fingerprint}</p>
            <p className="mt-1 text-xs text-slate-500">{device.platform} / {device.browser} / {device.timezone}</p>
          </div>
        </section>

        <GlassCard className="p-6 sm:p-8" glow>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-cyanGlow">Verification gate</p>
              <h2 className="mt-1 text-2xl font-black text-white">Verify Email OTP</h2>
            </div>
            <div className="rounded-2xl border border-successGlow/35 bg-successGlow/10 p-3 text-successGlow">
              <Mail className="h-6 w-6" />
            </div>
          </div>

          {statusMessage ? (
            <p className="mb-5 rounded-xl border border-successGlow/30 bg-successGlow/10 p-3 text-sm font-semibold text-cyan-100">
              {statusMessage}
            </p>
          ) : null}
          {authError ? <p className="mb-5 rounded-xl border border-redGlow/35 bg-redGlow/10 p-3 text-sm font-semibold text-red-200">{authError}</p> : null}

          <form className="space-y-5" onSubmit={onVerifyOtp}>
            <div>
              <label className="label-cyber" htmlFor="verifyEmail">Registered email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="verifyEmail"
                  className="input-cyber pl-11"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              {errors.email ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.email}</p> : null}
            </div>

            <div>
              <label className="label-cyber" htmlFor="emailOtp">6 digit verification OTP</label>
              <div className="relative">
                <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                <input
                  id="emailOtp"
                  className="input-cyber pl-11 tracking-[0.45em]"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              {errors.otp ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.otp}</p> : null}
            </div>

            <NeonButton type="submit" icon={ArrowRight} className="w-full" disabled={loading || resending}>
              {loading ? 'Verifying email' : 'Verify Email & Enter Banking'}
            </NeonButton>
          </form>

          <button
            type="button"
            onClick={onResendOtp}
            disabled={loading || resending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-cyanGlow/25 px-4 py-3 text-sm font-black text-cyan-100 transition hover:border-cyanGlow hover:bg-cyanGlow/10 disabled:opacity-50"
          >
            <RotateCcw className={`h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
            {resending ? 'Sending fresh OTP' : 'Resend OTP'}
          </button>

          <p className="mt-5 text-center text-sm text-slate-400">
            Wrong email?{' '}
            <Link to="/register" className="font-black text-cyan-100 transition hover:text-cyanGlow">
              Register again
            </Link>
          </p>
        </GlassCard>
      </div>
    </main>
  );
}

export default EmailVerificationPage;
