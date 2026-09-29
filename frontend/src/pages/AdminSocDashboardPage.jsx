import { Activity, AlertTriangle, Bot, Cpu, Fingerprint, Globe2, ShieldAlert, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import BehaviorAnalyticsChart from '../charts/BehaviorAnalyticsChart.jsx';
import HeatmapGrid from '../charts/HeatmapGrid.jsx';
import RiskTrendChart from '../charts/RiskTrendChart.jsx';
import ThreatSeverityChart from '../charts/ThreatSeverityChart.jsx';
import SuspiciousActivityFeed from '../components/security/SuspiciousActivityFeed.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import ProgressRing from '../components/ui/ProgressRing.jsx';
import SeverityBadge from '../components/ui/SeverityBadge.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { adminService } from '../services/adminService.js';
import { threatSeverityData } from '../utils/mockData.js';
import { formatNumber } from '../utils/format.js';

function AdminSocDashboardPage() {
  const {
    alerts,
    attackLogs,
    behaviorSeries,
    riskHistory,
    riskScore,
    suspiciousSessions,
    threatFeed,
  } = useSecurity();
  const [adminSnapshot, setAdminSnapshot] = useState(null);

  useEffect(() => {
    let mounted = true;
    adminService
      .logs()
      .then((response) => {
        if (mounted) {
          setAdminSnapshot(response.data?.data || response.data);
        }
      })
      .catch(() => {
        if (mounted) {
          setAdminSnapshot(null);
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  const backendThreats = adminSnapshot?.threats || [];
  const backendSessions = adminSnapshot?.sessions || [];
  const totalThreatsBlocked = adminSnapshot?.totalThreatsBlocked ?? 12482 + attackLogs.length;
  const activeSessionCount = adminSnapshot?.activeSessions ?? 1840 + suspiciousSessions.length;
  const fraudAttemptCount = adminSnapshot?.fraudAttempts ?? 326;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-black uppercase text-redGlow">Admin SOC dashboard</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">Cyber defense center.</h1>
          <p className="mt-3 max-w-3xl text-slate-400">A real-time command surface for fraud attempts, session risk, device trust, and transaction containment.</p>
        </div>
        <div className="rounded-2xl border border-cyanGlow/35 bg-cyanGlow/10 px-4 py-3 text-sm font-black text-cyan-100 shadow-neon">
          SIEM stream active · {backendThreats.length || threatFeed.length} live events
        </div>
      </div>

      <div className="metric-grid">
        <StatCard icon={ShieldAlert} label="Threats blocked" value={formatNumber(totalThreatsBlocked)} delta="+18.2%" tone="red" footer="today" />
        <StatCard icon={Users} label="Active sessions" value={formatNumber(activeSessionCount)} delta="+4.1%" tone="cyan" footer="global" />
        <StatCard icon={Bot} label="Fraud attempts" value={formatNumber(fraudAttemptCount)} delta="+32 live" tone="amber" footer="24h" />
        <StatCard icon={Activity} label="Risk median" value={`${Math.max(18, Math.round(riskScore * 0.72))}/100`} delta="adaptive" tone="emerald" footer="all users" />
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="p-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black uppercase text-cyanGlow">Risk analytics</p>
              <h2 className="mt-1 text-2xl font-black text-white">Fraud and hijack signals</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {threatSeverityData.map((item) => (
                <div key={item.name} className="rounded-xl border border-slate-800 bg-slate-950/55 p-2 text-center">
                  <p className="text-lg font-black text-white">{item.value}</p>
                  <p className="text-[11px] font-bold uppercase text-slate-500">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-5">
            <RiskTrendChart data={riskHistory} height={330} />
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-redGlow">Threat severity</p>
          <h2 className="mt-1 text-2xl font-black text-white">Blocked attack mix</h2>
          <div className="mt-5">
            <ThreatSeverityChart data={threatSeverityData} height={300} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-redGlow">Real-time attack logs</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">Log ID</th>
                  <th>Vector</th>
                  <th>Source IP</th>
                  <th>Severity</th>
                  <th>Action</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {(backendThreats.length ? backendThreats : attackLogs).map((log) => (
                  <tr key={log.id} className="text-slate-300">
                    <td className="py-4 font-mono text-cyan-100">{String(log.id).slice(0, 12)}</td>
                    <td className="font-bold text-white">{log.vector || log.title || log.type}</td>
                    <td className="font-mono">{log.ip || log.sourceIp || 'SOC edge'}</td>
                    <td><SeverityBadge severity={(log.severity || 'medium').toLowerCase()}>{log.severity}</SeverityBadge></td>
                    <td className="capitalize text-slate-300">{log.action || log.actionTaken || log.status}</td>
                    <td>{log.time || new Date(log.detectedAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-cyanGlow">Live threat feed</p>
          <div className="mt-5 max-h-[390px] overflow-y-auto pr-1">
            <SuspiciousActivityFeed items={threatFeed} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-successGlow">Behavior operations</p>
          <h2 className="mt-1 text-2xl font-black text-white">Session telemetry aggregate</h2>
          <div className="mt-5">
            <BehaviorAnalyticsChart data={behaviorSeries} height={300} />
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-warningGlow">Threat heatmap</p>
          <h2 className="mt-1 text-2xl font-black text-white">Regional attack density</h2>
          <div className="mt-5">
            <HeatmapGrid />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-cyanGlow">User session monitoring</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">Session</th>
                  <th>User</th>
                  <th>Device</th>
                  <th>Geo</th>
                  <th>Risk</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {(backendSessions.length ? backendSessions : suspiciousSessions).map((session) => (
                  <tr key={session.id} className="text-slate-300">
                    <td className="py-4 font-mono text-cyan-100">{String(session.id).slice(0, 12)}</td>
                    <td className="font-bold text-white">{session.user || 'Authenticated user'}</td>
                    <td>{session.device || session.deviceFingerprint || 'Trusted browser'}</td>
                    <td>{session.geo || session.ipAddress || 'Network edge'}</td>
                    <td className="font-black text-white">{session.risk ?? session.riskScore}/100</td>
                    <td className="capitalize">{String(session.status).toLowerCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="grid gap-6">
          <GlassCard className="p-5">
            <p className="text-sm font-black uppercase text-redGlow">Security alerts panel</p>
            <div className="mt-5 space-y-3">
              {alerts.slice(0, 4).map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-white">{alert.title}</p>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{alert.message}</p>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-sm font-black uppercase text-cyanGlow">Device tracking</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: Cpu, label: 'Trusted', value: '1,722' },
                { icon: Fingerprint, label: 'MFA', value: '88' },
                { icon: Globe2, label: 'VPN', value: '30' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3 text-center">
                  <item.icon className="mx-auto h-5 w-5 text-cyanGlow" />
                  <p className="mt-2 text-lg font-black text-white">{item.value}</p>
                  <p className="text-xs text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid place-items-center">
              <ProgressRing value={riskScore} size={150} />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default AdminSocDashboardPage;
