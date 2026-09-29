import { motion } from 'framer-motion';
import { ArrowRight, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import { useAuth } from '../context/AuthContext.jsx';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { forgotPassword, verifyResetOtp, resetPassword, authError } = useAuth();
  const [stage, setStage] = useState('email');
  const [email, setEmail] = useState('aarav.mehta@neurobank.ai');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [passwords, setPasswords] = useState({ newPassword: 'Secure@12345', confirmPassword: 'Secure@12345' });
  const [statusMessage, setStatusMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validEmail = () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const requestOtp = async (event) => {
    event.preventDefault();
    if (!validEmail()) {
      setErrors({ email: 'Enter a valid registered email' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setStatusMessage(response?.message || 'If this email exists, an OTP was sent.');
      setStage('otp');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: 'Enter the 6 digit reset OTP' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const response = await verifyResetOtp({ email, otp });
      setResetToken(response.resetToken);
      setStatusMessage('OTP verified. Create your new password.');
      setStage('reset');
    } finally {
      setLoading(false);
    }
  };

  const completeReset = async (event) => {
    event.preventDefault();
    if (passwords.newPassword.length < 8) {
      setErrors({ newPassword: 'Password must be at least 8 characters' });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const response = await resetPassword({ email, resetToken, ...passwords });
      setStatusMessage(response?.message || 'Password reset successful.');
      setStage('done');
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
              <p className="text-xs font-semibold text-slate-500">Email OTP recovery</p>
            </div>
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-black uppercase text-cyanGlow">Account recovery</p>
            <h1 className="mt-3 text-4xl font-black text-white sm:text-6xl">Reset password without weakening security.</h1>
            <p className="mt-5 max-w-2xl leading-8 text-slate-400">
              The backend verifies a short-lived email OTP, issues a reset token, updates the BCrypt password, and revokes existing sessions.
            </p>
          </motion.div>
        </section>

        <GlassCard className="p-6 sm:p-8" glow>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-cyanGlow">Forgot password</p>
              <h2 className="mt-1 text-2xl font-black text-white">
                {stage === 'email' ? 'Request OTP' : stage === 'otp' ? 'Verify OTP' : stage === 'reset' ? 'Create new password' : 'Password reset complete'}
              </h2>
            </div>
            <div className="rounded-2xl border border-successGlow/35 bg-successGlow/10 p-3 text-successGlow">
              <KeyRound className="h-6 w-6" />
            </div>
          </div>

          {statusMessage ? <p className="mb-5 rounded-xl border border-cyanGlow/30 bg-cyanGlow/10 p-3 text-sm font-semibold text-cyan-100">{statusMessage}</p> : null}
          {authError ? <p className="mb-5 rounded-xl border border-redGlow/35 bg-redGlow/10 p-3 text-sm font-semibold text-red-200">{authError}</p> : null}

          {stage === 'email' ? (
            <form className="space-y-5" onSubmit={requestOtp}>
              <div>
                <label className="label-cyber" htmlFor="resetEmail">Registered email</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input id="resetEmail" className="input-cyber pl-11" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                {errors.email ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.email}</p> : null}
              </div>
              <NeonButton type="submit" icon={ArrowRight} className="w-full" disabled={loading}>
                {loading ? 'Sending reset OTP' : 'Send Reset OTP'}
              </NeonButton>
            </form>
          ) : null}

          {stage === 'otp' ? (
            <form className="space-y-5" onSubmit={verifyOtp}>
              <div>
                <label className="label-cyber" htmlFor="resetOtp">6 digit reset OTP</label>
                <div className="relative">
                  <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input id="resetOtp" className="input-cyber pl-11 tracking-[0.45em]" inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} />
                </div>
                {errors.otp ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.otp}</p> : null}
              </div>
              <NeonButton type="submit" icon={ArrowRight} className="w-full" disabled={loading}>
                {loading ? 'Verifying OTP' : 'Verify OTP'}
              </NeonButton>
            </form>
          ) : null}

          {stage === 'reset' ? (
            <form className="space-y-5" onSubmit={completeReset}>
              <div>
                <label className="label-cyber" htmlFor="newPassword">New password</label>
                <input id="newPassword" className="input-cyber" type="password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} />
                {errors.newPassword ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.newPassword}</p> : null}
              </div>
              <div>
                <label className="label-cyber" htmlFor="confirmPassword">Confirm password</label>
                <input id="confirmPassword" className="input-cyber" type="password" value={passwords.confirmPassword} onChange={(event) => setPasswords((current) => ({ ...current, confirmPassword: event.target.value }))} />
                {errors.confirmPassword ? <p className="mt-2 text-sm font-semibold text-red-300">{errors.confirmPassword}</p> : null}
              </div>
              <NeonButton type="submit" icon={ArrowRight} className="w-full" disabled={loading}>
                {loading ? 'Resetting password' : 'Reset Password'}
              </NeonButton>
            </form>
          ) : null}

          {stage === 'done' ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-successGlow/30 bg-successGlow/10 p-4">
                <p className="text-sm font-black text-successGlow">Sessions revoked</p>
                <p className="mt-2 text-sm text-slate-300">Old refresh tokens were removed. Sign in again with the new password.</p>
              </div>
              <NeonButton type="button" icon={ArrowRight} className="w-full" onClick={() => navigate('/login')}>
                Back to Login
              </NeonButton>
            </div>
          ) : null}

          <p className="mt-5 text-center text-sm text-slate-400">
            Remembered it?{' '}
            <Link to="/login" className="font-black text-cyan-100 transition hover:text-cyanGlow">
              Return to login
            </Link>
          </p>
        </GlassCard>
      </div>
    </main>
  );
}

export default ForgotPasswordPage;
