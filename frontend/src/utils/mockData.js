import { formatTime } from './format.js';

export const balanceCards = [
  { label: 'Primary Checking', value: 128940, delta: '+4.8%', tone: 'cyan' },
  { label: 'Treasury Reserve', value: 482100, delta: '+1.2%', tone: 'emerald' },
  { label: 'Card Exposure', value: 18420, delta: '-8.3%', tone: 'amber' },
];

export const recentTransactions = [
  { id: 'TX-8104', merchant: 'Vertex Payroll', amount: 18400, status: 'cleared', risk: 'low', time: '09:42' },
  { id: 'TX-8103', merchant: 'Aster Cloud Infra', amount: 3520, status: 'reviewed', risk: 'medium', time: '09:18' },
  { id: 'TX-8102', merchant: 'Northline Logistics', amount: 890, status: 'cleared', risk: 'low', time: '08:51' },
  { id: 'TX-8101', merchant: 'Wire transfer hold', amount: 76000, status: 'blocked', risk: 'critical', time: '08:23' },
];

export const bankingActions = [
  { title: 'Transfer Money', route: '/transactions', accent: 'cyan' },
  { title: 'Live Monitor', route: '/monitor', accent: 'emerald' },
  { title: 'SOC Console', route: '/admin', accent: 'red' },
  { title: 'Attack Demo', route: '/simulation', accent: 'amber' },
];

export const seedRiskHistory = [
  { time: '09:00', score: 18, bot: 8, hijack: 5 },
  { time: '09:05', score: 22, bot: 12, hijack: 8 },
  { time: '09:10', score: 27, bot: 14, hijack: 11 },
  { time: '09:15', score: 24, bot: 11, hijack: 10 },
  { time: '09:20', score: 41, bot: 25, hijack: 18 },
  { time: '09:25', score: 46, bot: 31, hijack: 22 },
  { time: '09:30', score: 39, bot: 24, hijack: 17 },
  { time: '09:35', score: 54, bot: 38, hijack: 29 },
];

export const seedBehaviorSeries = [
  { time: '09:20', typing: 71, rhythm: 84, clicks: 9, mouse: 280 },
  { time: '09:22', typing: 76, rhythm: 79, clicks: 11, mouse: 334 },
  { time: '09:24', typing: 80, rhythm: 82, clicks: 8, mouse: 248 },
  { time: '09:26', typing: 122, rhythm: 51, clicks: 18, mouse: 511 },
  { time: '09:28', typing: 93, rhythm: 68, clicks: 12, mouse: 390 },
  { time: '09:30', typing: 108, rhythm: 57, clicks: 21, mouse: 640 },
  { time: '09:32', typing: 84, rhythm: 78, clicks: 10, mouse: 320 },
];

export const sessionTimeline = [
  { label: 'Login', time: '09:02:11', status: 'trusted' },
  { label: 'Device bound', time: '09:02:12', status: 'trusted' },
  { label: 'Typing baseline', time: '09:03:05', status: 'trusted' },
  { label: 'Tab switch', time: '09:08:44', status: 'watch' },
  { label: 'Paste event', time: '09:14:01', status: 'review' },
  { label: 'Transfer check', time: '09:18:39', status: 'trusted' },
];

export const seedAlerts = [
  {
    id: 'AL-1009',
    title: 'Copy-paste anomaly contained',
    message: 'Clipboard usage detected inside beneficiary field.',
    severity: 'medium',
    channel: 'email',
    status: 'delivered',
    time: '09:18:04',
  },
  {
    id: 'AL-1008',
    title: 'High-value transfer blocked',
    message: 'Transaction exceeded behavioral confidence threshold.',
    severity: 'critical',
    channel: 'sms + email',
    status: 'delivered',
    time: '08:23:44',
  },
  {
    id: 'AL-1007',
    title: 'New device verified',
    message: 'Adaptive MFA completed for Windows workstation.',
    severity: 'low',
    channel: 'email',
    status: 'delivered',
    time: '07:56:18',
  },
];

export const seedAttackLogs = [
  { id: 'LOG-8841', vector: 'Credential stuffing', ip: '185.72.14.20', severity: 'high', action: 'blocked', time: '09:22:10' },
  { id: 'LOG-8840', vector: 'Rapid click automation', ip: '102.44.18.71', severity: 'medium', action: 'challenged', time: '09:19:47' },
  { id: 'LOG-8839', vector: 'Session token replay', ip: '91.202.33.10', severity: 'critical', action: 'revoked', time: '09:12:03' },
  { id: 'LOG-8838', vector: 'Autofill abuse', ip: '45.19.8.221', severity: 'medium', action: 'reviewed', time: '09:07:30' },
];

export const seedSessions = [
  { id: 'SES-4412', user: 'anika.rao', device: 'Chrome / Windows', geo: 'Mumbai, IN', risk: 18, status: 'trusted' },
  { id: 'SES-4411', user: 'david.lee', device: 'Edge / Windows', geo: 'Singapore, SG', risk: 72, status: 'challenged' },
  { id: 'SES-4410', user: 'maria.khan', device: 'Mobile Safari', geo: 'Dubai, AE', risk: 32, status: 'trusted' },
  { id: 'SES-4409', user: 'irfan.shaikh', device: 'Headless Chrome', geo: 'Unknown VPN', risk: 91, status: 'revoked' },
];

export const threatSeverityData = [
  { name: 'Low', value: 82, fill: '#2dff9d' },
  { name: 'Medium', value: 46, fill: '#ffd166' },
  { name: 'High', value: 28, fill: '#ff8f3f' },
  { name: 'Critical', value: 12, fill: '#ff3f5f' },
];

export const seedThreatFeed = [
  { id: 'TF-51', label: 'Token replay rejected', source: 'Delhi edge node', severity: 'critical', time: 'now' },
  { id: 'TF-50', label: 'Bot cadence detected', source: 'Login cluster', severity: 'high', time: '1m ago' },
  { id: 'TF-49', label: 'Impossible travel check', source: 'Identity graph', severity: 'medium', time: '2m ago' },
  { id: 'TF-48', label: 'MFA push fatigue pattern', source: 'Auth service', severity: 'medium', time: '4m ago' },
];

export const attackProfiles = {
  hijack: {
    title: 'Session Hijack',
    description: 'Token replay and device fingerprint mismatch detected.',
    riskDelta: 50,
    vector: 'Session token replay',
    severity: 'critical',
  },
  bot: {
    title: 'Bot Attack',
    description: 'Linear cursor movement and impossible typing cadence.',
    riskDelta: 32,
    vector: 'Automation cluster',
    severity: 'high',
  },
  credential: {
    title: 'Credential Stuffing',
    description: 'Password spray burst across bank login endpoints.',
    riskDelta: 38,
    vector: 'Credential stuffing',
    severity: 'high',
  },
  autofill: {
    title: 'Autofill Fraud',
    description: 'Sensitive beneficiary fields filled faster than human baseline.',
    riskDelta: 24,
    vector: 'Autofill abuse',
    severity: 'medium',
  },
  rapid: {
    title: 'Rapid Transaction Attack',
    description: 'Repeated transfer attempts with rage-click pattern.',
    riskDelta: 48,
    vector: 'Rapid transfer automation',
    severity: 'critical',
  },
};

export function createAttackLog(profile) {
  return {
    id: `LOG-${Math.floor(9000 + Math.random() * 899)}`,
    vector: profile.vector,
    ip: `${Math.floor(11 + Math.random() * 220)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
    severity: profile.severity,
    action: profile.severity === 'critical' ? 'revoked' : 'challenged',
    time: formatTime(),
  };
}

export function createThreatEvent(profile) {
  return {
    id: `TF-${Math.floor(100 + Math.random() * 900)}`,
    label: profile.title,
    source: profile.vector,
    severity: profile.severity,
    time: 'now',
  };
}

export function createSuspiciousSession(profile, risk) {
  const users = ['rhea.merchant', 'omar.finops', 'lucas.cashops', 'nina.treasury'];
  return {
    id: `SES-${Math.floor(5000 + Math.random() * 899)}`,
    user: users[Math.floor(Math.random() * users.length)],
    device: profile.vector.includes('Automation') ? 'Headless Chrome' : 'Chrome / Unknown device',
    geo: ['Unknown VPN', 'Frankfurt, DE', 'São Paulo, BR', 'Lagos, NG'][Math.floor(Math.random() * 4)],
    risk,
    status: risk > 84 ? 'revoked' : 'challenged',
  };
}
