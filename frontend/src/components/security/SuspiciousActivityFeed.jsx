import { motion } from 'framer-motion';
import SeverityBadge from '../ui/SeverityBadge.jsx';

function SuspiciousActivityFeed({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <motion.div
          key={`${item.id || item.title || item.label}-${index}`}
          initial={{ opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.03 }}
          className="rounded-2xl border border-slate-800/80 bg-slate-950/50 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-black text-white">{item.label || item.title}</p>
              <p className="mt-1 text-xs text-slate-500">{item.source || item.message}</p>
            </div>
            <SeverityBadge severity={item.severity}>{item.severity}</SeverityBadge>
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-500">{item.time}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default SuspiciousActivityFeed;
