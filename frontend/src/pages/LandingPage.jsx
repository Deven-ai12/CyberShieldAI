import { motion } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Bot,
  BrainCircuit,
  Fingerprint,
  LockKeyhole,
  MousePointer2,
  Radar,
  ShieldCheck,
  Siren,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import RiskTrendChart from '../charts/RiskTrendChart.jsx';
import CyberBackground from '../components/background/CyberBackground.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import RiskBadge from '../components/ui/RiskBadge.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { fadeUp, staggerContainer } from '../animations/variants.js';
import { formatNumber } from '../utils/format.js';

const features = [
  { icon: Fingerprint, title: 'Behavior Biometrics', text: 'Typing cadence, mouse velocity, path entropy, rage clicks, clipboard use, tab switching, and inactivity form a live trust signature.' },
  { icon: BrainCircuit, title: 'AI Risk Engine', text: 'Session telemetry is scored continuously so compromised accounts move from low risk to containment before funds move.' },
  { icon: LockKeyhole, title: 'Hijack Prevention', text: 'Device fingerprint drift, token replay, impossible travel, and bot cadence trigger adaptive friction and session revocation.' },
];

const threats = [
  { icon: Bot, title: 'Bot Behavior', value: '98.7%', tone: 'text-cyanGlow' },
  { icon: MousePointer2, title: 'Abnormal Movement', value: '43 ms', tone: 'text-successGlow' },
  { icon: Siren, title: 'Fraud Blocks', value: '12.4k', tone: 'text-redGlow' },
  { icon: Zap, title: 'Decision Latency', value: '210 ms', tone: 'text-warningGlow' },
];

function LandingPage() {
  const { riskScore, riskLevel, riskHistory, threatFeed } = useSecurity();

  return (
    <div className="relative z-10">
      <CyberBackground />
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-2xl border border-cyanGlow/45 bg-cyanGlow/10 p-2 text-cyanGlow shadow-neon">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="font-black uppercase text-white">NeuroShield Sentinel</p>
            <p className="text-xs font-semibold text-slate-500">AI Fraud Defense</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-bold text-slate-300 md:flex">
          <a href="#features" className="transition hover:text-cyan-100">Features</a>
          <a href="#protection" className="transition hover:text-cyan-100">Protection</a>
          <Link to="/admin" className="transition hover:text-cyan-100">SOC</Link>
        </nav>
        <Link
          to="/login"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyanGlow/45 bg-cyanGlow/10 px-4 py-2.5 text-sm font-black text-cyan-100 shadow-neon transition hover:bg-cyanGlow/20"
        >
          Secure Login
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <main>
        <section className="mx-auto grid min-h-[86vh] max-w-7xl items-center px-4 pb-12 pt-10 sm:px-6 lg:px-8">
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="max-w-5xl">
            <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-successGlow/35 bg-successGlow/10 px-3 py-1.5 text-xs font-black uppercase text-emerald-200">
              <Radar className="h-4 w-4" />
              Real-time behavioral fraud intelligence
            </motion.div>
            <motion.h1 variants={fadeUp} className="max-w-5xl text-5xl font-black tracking-normal text-white sm:text-7xl lg:text-8xl">
              NeuroShield Sentinel
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-6 max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
              AI-powered session hijacking prevention and fraud detection for banking platforms that cannot wait for post-transaction review.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-cyanGlow/45 bg-cyanGlow/12 px-5 py-3 text-sm font-black text-cyan-100 shadow-neon transition hover:bg-cyanGlow/22"
              >
                Launch Banking Portal
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/simulation"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-redGlow/40 bg-redGlow/10 px-5 py-3 text-sm font-black text-red-100 shadow-danger transition hover:bg-redGlow/18"
              >
                Attack Simulation
                <Siren className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ['Threats Blocked', formatNumber(12482)],
              ['Active Sessions', formatNumber(1840)],
              ['Current Risk', `${riskScore}/100`],
              ['Latest Signal', threatFeed[0]?.label || 'Live'],
            ].map(([label, value], index) => (
              <GlassCard key={label} delay={index * 0.06} className="p-4">
                <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                <p className="mt-2 truncate text-2xl font-black text-white">{value}</p>
                {label === 'Current Risk' ? <RiskBadge score={riskScore} level={riskLevel} className="mt-3" /> : null}
              </GlassCard>
            ))}
          </div>
        </section>

        <section id="features" className="border-y border-slate-800/70 bg-slate-950/35 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-sm font-black uppercase text-cyanGlow">Platform intelligence</p>
              <h2 className="mt-3 text-3xl font-black text-white sm:text-5xl">Continuous fraud defense from login to transaction.</h2>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {features.map((feature, index) => (
                <GlassCard key={feature.title} delay={index * 0.08} className="p-6">
                  <feature.icon className="h-8 w-8 text-cyanGlow" />
                  <h3 className="mt-5 text-xl font-black text-white">{feature.title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{feature.text}</p>
                </GlassCard>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <GlassCard className="p-6">
              <p className="text-sm font-black uppercase text-successGlow">AI decision loop</p>
              <h2 className="mt-3 text-3xl font-black text-white">Signals become action in milliseconds.</h2>
              <p className="mt-4 leading-7 text-slate-400">
                NeuroShield streams behavioral telemetry into a risk engine that adapts to user context, device trust, and attack velocity.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {['Token replay', 'Copy-paste fraud', 'Autofill abuse', 'Rapid transaction attack'].map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 text-sm font-bold text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="p-6" glow>
              <RiskTrendChart data={riskHistory} height={330} />
            </GlassCard>
          </div>
        </section>

        <section id="protection" className="pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {threats.map((threat, index) => (
                <GlassCard key={threat.title} delay={index * 0.06} className="p-5">
                  <threat.icon className={`h-7 w-7 ${threat.tone}`} />
                  <p className="mt-4 text-sm font-bold text-slate-400">{threat.title}</p>
                  <p className="mt-2 text-3xl font-black text-white">{threat.value}</p>
                </GlassCard>
              ))}
            </div>
            <GlassCard className="mt-8 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div>
                  <p className="text-sm font-black uppercase text-redGlow">Jury demo ready</p>
                  <h2 className="mt-2 text-3xl font-black text-white">Run live attacks and watch risk escalate across the SOC.</h2>
                </div>
                <Link
                  to="/simulation"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-redGlow/45 bg-redGlow/10 px-5 py-3 text-sm font-black text-red-100 shadow-danger transition hover:bg-redGlow/18"
                >
                  Start Simulation
                  <Activity className="h-4 w-4" />
                </Link>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
