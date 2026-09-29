import { motion } from 'framer-motion';

const variants = {
  cyan: 'border-cyanGlow/45 bg-cyanGlow/10 text-cyan-100 shadow-neon hover:bg-cyanGlow/18',
  red: 'border-redGlow/45 bg-redGlow/10 text-red-100 shadow-danger hover:bg-redGlow/18',
  emerald: 'border-successGlow/45 bg-successGlow/10 text-emerald-100 shadow-success hover:bg-successGlow/18',
  amber: 'border-warningGlow/45 bg-warningGlow/10 text-amber-100 hover:bg-warningGlow/18',
  ghost: 'border-slate-700/70 bg-slate-950/45 text-slate-100 hover:border-cyanGlow/45 hover:text-cyan-100',
};

function NeonButton({ children, icon: Icon, variant = 'cyan', className = '', type = 'button', ...props }) {
  return (
    <motion.button
      type={type}
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {Icon ? <Icon className="h-4 w-4" /> : null}
      <span>{children}</span>
    </motion.button>
  );
}

export default NeonButton;
