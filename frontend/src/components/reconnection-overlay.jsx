// frontend/src/components/reconnection-overlay.jsx
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export default function ReconnectionOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="glass-card p-8 rounded-3xl text-center">
        <RefreshCw size={40} className="mx-auto animate-spin text-accent mb-4" />
        <h2 className="text-xl font-semibold">Reconnecting...</h2>
        <p className="text-gray-500 text-sm mt-2">
          Attempting to restore connection
        </p>
      </div>
    </motion.div>
  );
}