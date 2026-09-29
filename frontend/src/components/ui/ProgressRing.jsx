import { motion } from 'framer-motion';
import { getRiskLevel } from '../../utils/risk.js';

function ProgressRing({ value, size = 170, stroke = 12, label = 'Risk Score' }) {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const level = getRiskLevel(value);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(148,163,184,0.12)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={level.color}
          strokeLinecap="round"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 12px ${level.color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-4xl font-black text-white">{Math.round(value)}</span>
        <span className="mt-1 text-xs font-bold uppercase text-slate-400">{label}</span>
        <span className="mt-1 text-xs font-black" style={{ color: level.color }}>
          {level.label}
        </span>
      </div>
    </div>
  );
}

export default ProgressRing;
