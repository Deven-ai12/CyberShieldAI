export const riskLevels = {
  LOW: {
    label: 'LOW',
    min: 0,
    max: 39,
    color: '#2dff9d',
    bg: 'rgba(45, 255, 157, 0.1)',
    border: 'rgba(45, 255, 157, 0.36)',
  },
  MEDIUM: {
    label: 'MEDIUM',
    min: 40,
    max: 64,
    color: '#ffd166',
    bg: 'rgba(255, 209, 102, 0.11)',
    border: 'rgba(255, 209, 102, 0.36)',
  },
  HIGH: {
    label: 'HIGH',
    min: 65,
    max: 84,
    color: '#ff8f3f',
    bg: 'rgba(255, 143, 63, 0.12)',
    border: 'rgba(255, 143, 63, 0.38)',
  },
  CRITICAL: {
    label: 'CRITICAL',
    min: 85,
    max: 100,
    color: '#ff3f5f',
    bg: 'rgba(255, 63, 95, 0.13)',
    border: 'rgba(255, 63, 95, 0.46)',
  },
};

export function clampRisk(score) {
  return Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
}

export function getRiskLevel(score) {
  const value = clampRisk(score);
  if (value >= riskLevels.CRITICAL.min) return riskLevels.CRITICAL;
  if (value >= riskLevels.HIGH.min) return riskLevels.HIGH;
  if (value >= riskLevels.MEDIUM.min) return riskLevels.MEDIUM;
  return riskLevels.LOW;
}

export function scoreFromBehavior(metrics) {
  let score = 12;

  if (metrics.typingSpeed > 120) score += 12;
  if (metrics.typingSpeed > 180) score += 16;
  if (metrics.mouseMovementSpeed > 900) score += 12;
  if (metrics.clickFrequency > 32) score += 16;
  if (metrics.rageClickDetected) score += 18;
  if (metrics.copyPasteDetected) score += 14;
  if (metrics.autofillDetected) score += 18;
  if (metrics.tabSwitchCount > 2) score += 10;
  if (metrics.inactiveTime > 90) score += 6;
  if (metrics.scrollVelocity > 1800) score += 6;

  return clampRisk(score);
}

export function severityForRisk(score) {
  const level = getRiskLevel(score).label;
  if (level === 'CRITICAL') return 'critical';
  if (level === 'HIGH') return 'high';
  if (level === 'MEDIUM') return 'medium';
  return 'low';
}
