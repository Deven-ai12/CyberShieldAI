import { AlertTriangle, Clock3, Copy, Eye, Keyboard, MousePointer2, RadioTower, TimerReset } from 'lucide-react';
import BehaviorAnalyticsChart from '../charts/BehaviorAnalyticsChart.jsx';
import MousePathCanvas from '../charts/MousePathCanvas.jsx';
import RiskTrendChart from '../charts/RiskTrendChart.jsx';
import SessionTimeline from '../charts/SessionTimeline.jsx';
import SuspiciousActivityFeed from '../components/security/SuspiciousActivityFeed.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import ProgressRing from '../components/ui/ProgressRing.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { sessionTimeline } from '../utils/mockData.js';

function LiveSecurityMonitorPage() {
  const { liveMetrics, behaviorSeries, riskHistory, riskScore, alerts, threatFeed } = useSecurity();

  const metricCards = [
    { label: 'Typing speed', value: `${liveMetrics.typingSpeed} WPM`, delta: `${liveMetrics.typingRhythm}% rhythm`, icon: Keyboard, tone: 'cyan' },
    { label: 'Mouse velocity', value: `${liveMetrics.mouseMovementSpeed} px/s`, delta: `${liveMetrics.mousePath.length} path points`, icon: MousePointer2, tone: 'emerald' },
    { label: 'Click frequency', value: `${liveMetrics.clickFrequency}/min`, delta: liveMetrics.rageClickDetected ? 'rage clicking' : 'normal cadence', icon: TimerReset, tone: liveMetrics.rageClickDetected ? 'red' : 'amber' },
    { label: 'Tab switches', value: liveMetrics.tabSwitchCount, delta: `${liveMetrics.inactiveTime}s inactive`, icon: Eye, tone: liveMetrics.tabSwitchCount > 2 ? 'red' : 'cyan' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-black uppercase text-redGlow">Live security monitor</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">Behavior biometrics command view.</h1>
          <p className="mt-3 max-w-3xl text-slate-400">Every movement, keystroke pattern, clipboard action, and session signal changes the risk profile in real time.</p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-successGlow/35 bg-successGlow/10 px-4 py-2 text-sm font-black text-emerald-200">
          <RadioTower className="h-4 w-4" />
          Streaming to /api/behavior/track
        </div>
      </div>

      <div className="metric-grid">
        {metricCards.map((metric, index) => (
          <StatCard key={metric.label} {...metric} footer="live" delay={index * 0.04} />
        ))}
      </div>

      {(liveMetrics.copyPasteDetected || liveMetrics.autofillDetected || liveMetrics.rageClickDetected) ? (
        <GlassCard className="border-redGlow/40 p-4 shadow-danger">
          <div className="flex items-center gap-3 text-red-100">
            <AlertTriangle className="h-6 w-6" />
            <div>
              <p className="font-black">Suspicious activity detected</p>
              <p className="text-sm text-slate-300">
                {liveMetrics.autofillDetected ? 'Autofill abuse signal' : liveMetrics.copyPasteDetected ? 'Copy-paste fraud signal' : 'Rapid click burst'} escalated the current session.
              </p>
            </div>
          </div>
        </GlassCard>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="grid place-items-center p-5">
          <ProgressRing value={riskScore} size={210} />
          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3 text-center">
              <Copy className="mx-auto h-5 w-5 text-warningGlow" />
              <p className="mt-2 text-xs text-slate-500">Copy/Paste</p>
              <p className="font-black text-white">{liveMetrics.copyPasteDetected ? 'Detected' : 'Clear'}</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3 text-center">
              <Clock3 className="mx-auto h-5 w-5 text-cyanGlow" />
              <p className="mt-2 text-xs text-slate-500">Inactive time</p>
              <p className="font-black text-white">{liveMetrics.inactiveTime}s</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-cyanGlow">Mouse tracking visualization</p>
          <h2 className="mt-1 text-2xl font-black text-white">Live pointer path entropy</h2>
          <div className="mt-5">
            <MousePathCanvas path={liveMetrics.mousePath} height={320} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-successGlow">Typing rhythm and click frequency</p>
          <h2 className="mt-1 text-2xl font-black text-white">Behavior analytics chart</h2>
          <div className="mt-5">
            <BehaviorAnalyticsChart data={behaviorSeries} height={320} />
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-redGlow">Risk progression</p>
          <h2 className="mt-1 text-2xl font-black text-white">LOW → MEDIUM → HIGH → CRITICAL</h2>
          <div className="mt-5">
            <RiskTrendChart data={riskHistory} height={320} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-cyanGlow">Session timeline</p>
          <div className="mt-5">
            <SessionTimeline events={sessionTimeline} />
          </div>
        </GlassCard>
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-redGlow">Suspicious activity feed</p>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <SuspiciousActivityFeed items={[...alerts.slice(0, 3), ...threatFeed.slice(0, 3)]} />
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

export default LiveSecurityMonitorPage;
