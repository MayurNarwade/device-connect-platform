import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/useUIStore';
import { X } from 'lucide-react';

export default function Toast() {
  const { toasts, dismissToast } = useUIStore();

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className="glass-card px-5 py-3 rounded-2xl flex items-center gap-3 min-w-[250px]"
          >
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button onClick={() => dismissToast(toast.id)} className="text-gray-500 hover:text-gray-800">
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}