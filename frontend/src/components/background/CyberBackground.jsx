import { motion } from 'framer-motion';

function CyberBackground({ fixed = false }) {
  return (
    <div className={`${fixed ? 'fixed' : 'absolute'} inset-0 -z-10 overflow-hidden bg-obsidian`}>
      <div className="absolute inset-0 bg-radial-grid bg-[length:100%_100%,44px_44px,44px_44px] opacity-80 animate-gridDrift" />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,transparent_0%,rgba(16,217,255,0.08)_36%,transparent_48%,rgba(255,63,95,0.09)_74%,transparent_100%)]" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(180deg,rgba(16,217,255,0.12),transparent)]" />
      <motion.div
        className="absolute left-0 top-0 h-full w-full bg-[linear-gradient(180deg,transparent,rgba(16,217,255,0.08),transparent)] opacity-30"
        animate={{ y: ['-100%', '100%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(16,217,255,0.18),transparent_34%),radial-gradient(circle_at_85%_16%,rgba(255,63,95,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,7,12,0.28),#05070c_88%)]" />
    </div>
  );
}

export default CyberBackground;
