import { Activity, ArrowUpRight, CreditCard, Landmark, MonitorSmartphone, ShieldCheck, WalletCards } from 'lucide-react';
import { Link } from 'react-router-dom';
import BehaviorAnalyticsChart from '../charts/BehaviorAnalyticsChart.jsx';
import GlassCard from '../components/ui/GlassCard.jsx';
import ProgressRing from '../components/ui/ProgressRing.jsx';
import RiskBadge from '../components/ui/RiskBadge.jsx';
import SeverityBadge from '../components/ui/SeverityBadge.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSecurity } from '../context/SecurityContext.jsx';
import { balanceCards, bankingActions, recentTransactions } from '../utils/mockData.js';
import { formatCurrency } from '../utils/format.js';
import { getDeviceProfile } from '../utils/device.js';

function BankingDashboardPage() {
  const { user } = useAuth();
  const { riskScore, riskLevel, behaviorSeries, liveMetrics } = useSecurity();
  const device = getDeviceProfile();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-black uppercase text-cyanGlow">Protected banking workspace</p>
          <h1 className="mt-2 text-3xl font-black text-white sm:text-5xl">Welcome, {user?.name || 'Analyst'}.</h1>
          <p className="mt-3 max-w-3xl text-slate-400">Real-time account protection is active across login, navigation, and transaction intent.</p>
        </div>
        <RiskBadge score={riskScore} level={riskLevel} className="w-fit" />
      </div>

      <div className="metric-grid">
        {balanceCards.map((card, index) => (
          <StatCard
            key={card.label}
            icon={index === 0 ? WalletCards : index === 1 ? Landmark : CreditCard}
            label={card.label}
            value={formatCurrency(card.value)}
            delta={card.delta}
            tone={card.tone}
            footer="30d change"
            delay={index * 0.05}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-successGlow">Recent transactions</p>
              <h2 className="mt-1 text-2xl font-black text-white">Fraud-screened activity</h2>
            </div>
            <Link to="/transactions" className="inline-flex items-center gap-2 rounded-xl border border-cyanGlow/40 px-3 py-2 text-sm font-bold text-cyan-100">
              New transfer
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3">ID</th>
                  <th>Merchant</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Risk</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="text-slate-300">
                    <td className="py-4 font-mono text-cyan-100">{transaction.id}</td>
                    <td className="font-bold text-white">{transaction.merchant}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td className="capitalize">{transaction.status}</td>
                    <td><SeverityBadge severity={transaction.risk}>{transaction.risk}</SeverityBadge></td>
                    <td>{transaction.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="grid place-items-center p-5 text-center">
          <ProgressRing value={riskScore} />
          <p className="mt-3 text-lg font-black text-white">Security status: {riskLevel.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">Session confidence updates continuously from behavior biometrics and device trust.</p>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <GlassCard className="p-5">
          <p className="text-sm font-black uppercase text-cyanGlow">Active device</p>
          <div className="mt-4 flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
            <MonitorSmartphone className="h-8 w-8 text-cyanGlow" />
            <div>
              <h3 className="text-xl font-black text-white">{device.platform}</h3>
              <p className="mt-1 text-sm text-slate-400">{device.browser} · {device.screen}</p>
              <p className="mt-2 font-mono text-xs text-slate-500">{device.fingerprint}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
              <p className="text-xs text-slate-500">Typing</p>
              <p className="mt-1 text-xl font-black text-white">{liveMetrics.typingSpeed} WPM</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
              <p className="text-xs text-slate-500">Clicks</p>
              <p className="mt-1 text-xl font-black text-white">{liveMetrics.clickFrequency}/min</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-3">
              <p className="text-xs text-slate-500">Tabs</p>
              <p className="mt-1 text-xl font-black text-white">{liveMetrics.tabSwitchCount}</p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-successGlow" />
            <div>
              <p className="text-sm font-black uppercase text-successGlow">Behavior analytics</p>
              <h2 className="text-2xl font-black text-white">Live trust telemetry</h2>
            </div>
          </div>
          <div className="mt-5">
            <BehaviorAnalyticsChart data={behaviorSeries} />
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {bankingActions.map((action) => (
          <Link
            key={action.title}
            to={action.route}
            className="glass-panel cyber-border rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-neon"
          >
            <ShieldCheck className="h-6 w-6 text-cyanGlow" />
            <p className="mt-4 text-lg font-black text-white">{action.title}</p>
            <p className="mt-2 text-sm text-slate-500">Protected workflow</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BankingDashboardPage;
