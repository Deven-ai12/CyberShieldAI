import { motion } from 'framer-motion';

function GlassCard({ children, className = '', delay = 0, glow = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className={`glass-panel cyber-border rounded-2xl ${glow ? 'shadow-neon' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default GlassCard;
