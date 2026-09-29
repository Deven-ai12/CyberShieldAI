import { AlertTriangle, CheckCircle2, RadioTower, ShieldAlert, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '../../context/ToastContext.jsx';

const icons = {
  low: CheckCircle2,
  medium: RadioTower,
  high: AlertTriangle,
  critical: ShieldAlert,
};

const styles = {
  low: 'border-successGlow/35 bg-emerald-950/80 text-emerald-100',
  medium: 'border-warningGlow/35 bg-amber-950/80 text-amber-100',
  high: 'border-orange-400/35 bg-orange-950/80 text-orange-100',
  critical: 'border-redGlow/45 bg-red-950/80 text-red-100 shadow-danger',
};

function ToastStack() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => {
          const Icon = icons[toast.severity] || RadioTower;
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 30, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 30, scale: 0.96 }}
              className={`glass-panel rounded-2xl border p-4 ${styles[toast.severity] || styles.medium}`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-black">{toast.title}</p>
                  <p className="mt-1 text-sm text-slate-300">{toast.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

export default ToastStack;
