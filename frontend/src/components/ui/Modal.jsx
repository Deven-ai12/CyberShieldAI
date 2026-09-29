import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

function Modal({ open, title, children, onClose, footer }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/78 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 22, scale: 0.97 }}
            className="glass-panel cyber-border w-full max-w-xl rounded-2xl p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-white">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-700/70 p-2 text-slate-300 transition hover:border-cyanGlow/40 hover:text-cyan-100"
                aria-label="Close modal"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-5">{children}</div>
            {footer ? <div className="mt-5 flex flex-wrap justify-end gap-3">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default Modal;
