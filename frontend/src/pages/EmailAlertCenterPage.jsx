import { BellRing, CheckCircle2, MailCheck, Send, ShieldAlert, XCircle } from 'lucide-react';
import { useMemo } from 'react';
import GlassCard from '../components/ui/GlassCard.jsx';
import NeonButton from '../components/ui/NeonButton.jsx';
import SeverityBadge from '../components/ui/SeverityBadge.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';

function EmailAlertCenterPage() {
  const { alerts, pushAlert } = useSecurity();
  const blockedTransactions = useMemo(
    () => alerts.filter((alert) => alert.severity === 'critical' || /blocked/i.test(alert.title)),
    [alerts],
  );

  const sendTestAlert = () => {
    pushAlert({
      title: 'Suspicious login notification sent',
      message: 'Adaptive alert delivered to customer and SOC mailbox.',
      severity: 'medium',
      channel: 'email',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-black uppercase text-cyanGlow">Email alert center</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">Fraud notifications and delivery status.</h1>
          <p className="mt-3 max-w-3xl text-slate-400">Customer-facing security alerts, blocked transaction messages, suspicious login notices, and SOC delivery confirmations.</p>
        </div>
        <NeonButton icon={Send} onClick={sendTestAlert}>Send test alert</NeonButton>
      </div>

      <div className="metric-grid">
        <StatCard icon={MailCheck} label="Sent alerts" value={alerts.length} delta="100% queued" tone="cyan" footer="today" />
        <StatCard icon={ShieldAlert} label="Blocked transactions" value={blockedTransactions.length} delta="contained" tone="red" footer="critical" />
        <StatCard icon={BellRing} label="Suspicious login notices" value={Math.max(3, alerts.filter((alert) => /login/i.test(alert.title)).length)} delta="+2 live" tone="amber" footer="24h" />
        <StatCard icon={CheckCircle2} label="Delivery success" value="99.2%" delta="email + SOC" tone="emerald" footer="SLA" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-cyanGlow">Sent alerts</p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">Alert</th>
                  <th>Severity</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="text-slate-300">
                    <td className="py-4">
                      <p className="font-black text-white">{alert.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{alert.message}</p>
                    </td>
                    <td><SeverityBadge severity={alert.severity} /></td>
                    <td className="capitalize">{alert.channel}</td>
                    <td className="capitalize text-successGlow">{alert.status}</td>
                    <td>{alert.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="grid gap-6">
          <GlassCard className="p-5">
            <p className="text-sm font-black uppercase text-redGlow">Blocked transactions</p>
            <div className="mt-5 space-y-3">
              {(blockedTransactions.length ? blockedTransactions : alerts.slice(0, 3)).map((alert) => (
                <div key={alert.id} className="rounded-2xl border border-redGlow/25 bg-redGlow/10 p-3">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-redGlow" />
                    <p className="font-black text-white">{alert.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-slate-400">{alert.message}</p>
                </div>
              ))}
            </div>
          </GlassCard>
          <GlassCard className="p-5">
            <p className="text-sm font-black uppercase text-successGlow">Delivery telemetry</p>
            <div className="mt-5 space-y-4">
              {['Primary email gateway', 'SOC mailbox', 'Customer SMS bridge', 'Webhook queue'].map((item, index) => (
                <div key={item}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-bold text-slate-300">{item}</span>
                    <span className="font-black text-white">{99 - index * 2}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-cyanGlow shadow-neon" style={{ width: `${99 - index * 2}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

export default EmailAlertCenterPage;
