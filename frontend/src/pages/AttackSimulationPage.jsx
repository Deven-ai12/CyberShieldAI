import { Bot, Eraser, Fingerprint, KeyRound, MousePointerClick, ShieldAlert, Siren, Zap } from 'lucide-react';
import { useState } from 'react';
import RiskTrendChart from '../charts/RiskTrendChart.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import ProgressRing from '../components/ui/ProgressRing.jsx';
import SeverityBadge from '../components/ui/SeverityBadge.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { attackProfiles } from '../utils/mockData.js';

const attackButtons = [
  { id: 'hijack', label: 'Simulate Session Hijack', icon: Fingerprint, tone: 'red' },
  { id: 'bot', label: 'Simulate Bot Attack', icon: Bot, tone: 'cyan' },
  { id: 'credential', label: 'Simulate Credential Stuffing', icon: KeyRound, tone: 'amber' },
  { id: 'autofill', label: 'Simulate Autofill Fraud', icon: Zap, tone: 'emerald' },
  { id: 'rapid', label: 'Simulate Rapid Transaction Attack', icon: MousePointerClick, tone: 'red' },
];

function AttackSimulationPage() {
  const { attackLogs, riskHistory, riskScore, resetRisk, simulateAttack, suspiciousSessions, threatFeed } = useSecurity();
  const [running, setRunning] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const runAttack = async (id) => {
    setRunning(id);
    const result = await simulateAttack(id);
    setLastResult(result);
    window.setTimeout(() => setRunning(null), 650);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-black uppercase text-warningGlow">Attack simulation center</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">Interactive fraud demo console.</h1>
          <p className="mt-3 max-w-3xl text-slate-400">Each simulation raises risk, animates charts, creates alerts, adds attack logs, and injects suspicious sessions into the SOC dashboard.</p>
        </div>
        <NeonButton icon={Eraser} variant="ghost" onClick={resetRisk}>Reset risk</NeonButton>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <GlassCard className="grid place-items-center p-5">
          <ProgressRing value={riskScore} size={220} />
          {lastResult ? (
            <div className="mt-5 w-full rounded-2xl border border-redGlow/35 bg-redGlow/10 p-4">
              <div className="flex items-center gap-3 text-red-100">
                <Siren className="h-6 w-6" />
                <div>
                  <p className="font-black">{lastResult.profile.title} blocked</p>
                  <p className="text-sm text-slate-300">{lastResult.profile.description}</p>
                </div>
              </div>
            </div>
          ) : null}
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-redGlow">Jury demo controls</p>
          <h2 className="mt-1 text-2xl font-black text-white">Launch attack vectors</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {attackButtons.map((attack) => {
              const profile = attackProfiles[attack.id];
              return (
                <button
                  key={attack.id}
                  type="button"
                  onClick={() => runAttack(attack.id)}
                  className={`group rounded-2xl border p-4 text-left transition hover:-translate-y-1 ${
                    running === attack.id
                      ? 'border-redGlow/60 bg-redGlow/18 shadow-danger'
                      : 'border-slate-800 bg-slate-950/55 hover:border-cyanGlow/45 hover:bg-slate-900/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="rounded-xl border border-cyanGlow/30 bg-cyanGlow/10 p-3 text-cyanGlow">
                      <attack.icon className="h-6 w-6" />
                    </div>
                    <SeverityBadge severity={profile.severity}>{profile.severity}</SeverityBadge>
                  </div>
                  <p className="mt-4 text-lg font-black text-white">{attack.label}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{profile.description}</p>
                  <p className="mt-3 text-xs font-black uppercase text-redGlow">+{profile.riskDelta} risk delta</p>
                </button>
              );
            })}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-cyanGlow">Animated risk impact</p>
          <div className="mt-5">
            <RiskTrendChart data={riskHistory} height={330} />
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-warningGlow">Latest suspicious session</p>
          <div className="mt-5 space-y-3">
            {suspiciousSessions.slice(0, 4).map((session) => (
              <div key={session.id} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-sm font-black text-cyan-100">{session.id}</p>
                  <span className="text-sm font-black text-red-200">{session.risk}/100</span>
                </div>
                <p className="mt-2 font-bold text-white">{session.user}</p>
                <p className="text-sm text-slate-500">{session.device} · {session.geo}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-redGlow">Attack logs updated live</p>
          <div className="mt-5 space-y-3">
            {attackLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-white">{log.vector}</p>
                  <SeverityBadge severity={log.severity} />
                </div>
                <p className="mt-2 font-mono text-xs text-slate-500">{log.ip} · {log.action} · {log.time}</p>
              </div>
            ))}
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-cyanGlow">Threat feed injection</p>
          <div className="mt-5 space-y-3">
            {threatFeed.slice(0, 5).map((threat) => (
              <div key={threat.id} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
                <ShieldAlert className="h-5 w-5 text-redGlow" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-white">{threat.label}</p>
                  <p className="text-sm text-slate-500">{threat.source}</p>
                </div>
                <SeverityBadge severity={threat.severity} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default AttackSimulationPage;
