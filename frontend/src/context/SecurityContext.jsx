import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { alertService } from '../services/alertService.js';
import {
  attackProfiles,
  createAttackLog,
  createSuspiciousSession,
  createThreatEvent,
  seedAlerts,
  seedAttackLogs,
  seedBehaviorSeries,
  seedRiskHistory,
  seedSessions,
  seedThreatFeed,
} from '../utils/mockData.js';
import { formatTime } from '../utils/format.js';
import { clampRisk, getRiskLevel, scoreFromBehavior, severityForRisk } from '../utils/risk.js';
import { useToast } from './ToastContext.jsx';

const SecurityContext = createContext(null);
const securityStorageKey = 'neuroshield.security';

const defaultMetrics = {
  typingSpeed: 0,
  typingRhythm: 100,
  mouseMovementSpeed: 0,
  mousePath: [],
  clickFrequency: 0,
  rageClickDetected: false,
  copyPasteDetected: false,
  autofillDetected: false,
  tabSwitchCount: 0,
  inactiveTime: 0,
  scrollDepth: 0,
  scrollVelocity: 0,
};

function readStoredSecurityState() {
  try {
    const raw = localStorage.getItem(securityStorageKey);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function SecurityProvider({ children }) {
  const { addToast } = useToast();
  const storedStateRef = useRef(readStoredSecurityState());
  const [riskScore, setRiskScore] = useState(storedStateRef.current.riskScore ?? 24);
  const [riskHistory, setRiskHistory] = useState(storedStateRef.current.riskHistory ?? seedRiskHistory);
  const [behaviorSeries, setBehaviorSeries] = useState(storedStateRef.current.behaviorSeries ?? seedBehaviorSeries);
  const [alerts, setAlerts] = useState(storedStateRef.current.alerts ?? seedAlerts);
  const [attackLogs, setAttackLogs] = useState(storedStateRef.current.attackLogs ?? seedAttackLogs);
  const [suspiciousSessions, setSuspiciousSessions] = useState(storedStateRef.current.suspiciousSessions ?? seedSessions);
  const [threatFeed, setThreatFeed] = useState(storedStateRef.current.threatFeed ?? seedThreatFeed);
  const [liveMetrics, setLiveMetrics] = useState(defaultMetrics);
  const lastBehaviorAlertRef = useRef(0);

  const pushAlert = useCallback(
    (alert) => {
      const nextAlert = {
        id: alert.id || `AL-${Math.floor(1100 + Math.random() * 8900)}`,
        channel: alert.channel || 'email',
        status: alert.status || 'delivered',
        time: alert.time || formatTime(),
        ...alert,
      };
      setAlerts((current) => [nextAlert, ...current].slice(0, 12));
      if (alert.toast !== false) {
        addToast({
          title: nextAlert.title,
          message: nextAlert.message,
          severity: nextAlert.severity,
        });
      }
      return nextAlert;
    },
    [addToast],
  );

  const recordAttackLog = useCallback((log) => {
    setAttackLogs((current) => [log, ...current].slice(0, 14));
  }, []);

  const updateFromBehavior = useCallback(
    (metrics) => {
      setLiveMetrics((current) => ({ ...current, ...metrics }));
      const behaviorRisk = scoreFromBehavior(metrics);
      setRiskScore((current) => {
        if (behaviorRisk >= 78) return clampRisk(current + 7);
        if (behaviorRisk >= 60) return clampRisk(current + 5);
        if (behaviorRisk >= 38) return clampRisk(current + 3);
        if (current > 40) return clampRisk(current - 1);
        return clampRisk(Math.max(18, current));
      });
      setBehaviorSeries((current) =>
        [
          ...current,
          {
            time: formatTime(new Date()),
            typing: metrics.typingSpeed,
            rhythm: metrics.typingRhythm,
            clicks: metrics.clickFrequency,
            mouse: Math.round(metrics.mouseMovementSpeed),
          },
        ].slice(-12),
      );

      const suspicious =
        metrics.copyPasteDetected ||
        metrics.autofillDetected ||
        metrics.rageClickDetected ||
        metrics.clickFrequency > 32 ||
        metrics.tabSwitchCount > 3;

      if (suspicious && Date.now() - lastBehaviorAlertRef.current > 6000) {
        lastBehaviorAlertRef.current = Date.now();
        pushAlert({
          title: metrics.autofillDetected
            ? 'Autofill fraud signal'
            : metrics.rageClickDetected
              ? 'Rage-click burst detected'
              : 'Behavior anomaly detected',
          message: 'Live biometric signals moved outside the trusted session envelope.',
          severity: severityForRisk(behaviorRisk),
          channel: 'email + dashboard',
        });
      }
    },
    [pushAlert],
  );

  const simulateAttack = useCallback(
    async (type) => {
      const profile = attackProfiles[type];
      if (!profile) return null;

      let nextScore = 0;
      setRiskScore((current) => {
        nextScore = clampRisk(current + profile.riskDelta);
        return nextScore;
      });

      const log = createAttackLog(profile);
      const threat = createThreatEvent(profile);
      const session = createSuspiciousSession(profile, clampRisk(riskScore + profile.riskDelta));

      recordAttackLog(log);
      setThreatFeed((current) => [threat, ...current].slice(0, 12));
      setSuspiciousSessions((current) => [session, ...current].slice(0, 10));
      setRiskHistory((current) =>
        [
          ...current,
          {
            time: formatTime(),
            score: clampRisk(riskScore + profile.riskDelta),
            bot: type === 'bot' || type === 'credential' ? 78 : 42,
            hijack: type === 'hijack' ? 91 : 36,
          },
        ].slice(-12),
      );

      const alert = pushAlert({
        title: `${profile.title} blocked`,
        message: profile.description,
        severity: profile.severity,
        channel: 'email + SOC',
      });

      alertService.sendAlert({ ...alert, attackType: type }).catch(() => {});
      return { profile, log, threat, session, riskScore: nextScore };
    },
    [pushAlert, recordAttackLog, riskScore],
  );

  const resetRisk = useCallback(() => {
    setRiskScore(24);
    addToast({
      title: 'Session risk recalibrated',
      message: 'Behavioral baseline restored to trusted mode.',
      severity: 'low',
    });
  }, [addToast]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const feedPool = [
        { title: 'Velocity rule cleared', vector: 'Transaction mesh', severity: 'low' },
        { title: 'VPN reputation spike', vector: 'Geo intelligence', severity: 'medium' },
        { title: 'Bot signature rejected', vector: 'Login perimeter', severity: 'high' },
        { title: 'Device fingerprint mismatch', vector: 'Session guard', severity: 'medium' },
      ];
      const event = createThreatEvent(feedPool[Math.floor(Math.random() * feedPool.length)]);
      setThreatFeed((current) => [event, ...current].slice(0, 12));
      setRiskHistory((current) =>
        [
          ...current,
          {
            time: formatTime(),
            score: riskScore,
            bot: Math.max(8, Math.round(riskScore * 0.66)),
            hijack: Math.max(5, Math.round(riskScore * 0.52)),
          },
        ].slice(-12),
      );
    }, 9000);

    return () => window.clearInterval(interval);
  }, [riskScore]);

  useEffect(() => {
    localStorage.setItem(
      securityStorageKey,
      JSON.stringify({
        alerts,
        attackLogs,
        behaviorSeries,
        riskHistory,
        riskScore,
        suspiciousSessions,
        threatFeed,
      }),
    );
  }, [alerts, attackLogs, behaviorSeries, riskHistory, riskScore, suspiciousSessions, threatFeed]);

  const riskLevel = getRiskLevel(riskScore);

  const value = useMemo(
    () => ({
      alerts,
      attackLogs,
      behaviorSeries,
      liveMetrics,
      pushAlert,
      recordAttackLog,
      resetRisk,
      riskHistory,
      riskLevel,
      riskScore,
      setRiskScore,
      simulateAttack,
      suspiciousSessions,
      threatFeed,
      updateFromBehavior,
    }),
    [
      alerts,
      attackLogs,
      behaviorSeries,
      liveMetrics,
      pushAlert,
      recordAttackLog,
      resetRisk,
      riskHistory,
      riskLevel,
      riskScore,
      simulateAttack,
      suspiciousSessions,
      threatFeed,
      updateFromBehavior,
    ],
  );

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>;
}

export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used inside SecurityProvider');
  }
  return context;
}
