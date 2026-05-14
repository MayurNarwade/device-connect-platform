import { motion } from 'framer-motion';
import { X, Download, Loader2, RefreshCw } from 'lucide-react';

export default function TransferProgress({ transfers = [], onRetry }) {
  const transferList = Array.isArray(transfers) ? transfers : [];

  if (transferList.length === 0) return null;

  return (
    <div className="space-y-2">
      {transferList.map((transfer) => (
        <motion.div
          key={transfer.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="glass-card p-3 rounded-xl"
        >
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {transfer.status === 'transferring' && (
                <Loader2 size={16} className="animate-spin text-blue-400" />
              )}
              {transfer.status === 'completed' && (
                <Download size={16} className="text-green-400" />
              )}
              {transfer.status === 'cancelled' && (
                <X size={16} className="text-red-400" />
              )}
              <span className="text-sm font-medium truncate">{transfer.name}</span>
            </div>
            <div className="flex gap-1">
              {transfer.status === 'cancelled' && onRetry && transfer.file && (
                <button
                  onClick={() => onRetry(transfer)}
                  className="text-blue-400 hover:text-blue-300 p-1"
                  title="Retry transfer"
                >
                  <RefreshCw size={14} />
                </button>
              )}
              {transfer.cancelFn && transfer.status === 'transferring' && (
                <button
                  onClick={() => transfer.cancelFn()}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${transfer.progress || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>{transfer.progress || 0}%</span>
            {transfer.speed > 0 && (
              <span>{(transfer.speed / 1024).toFixed(1)} KB/s</span>
            )}
            {transfer.status === 'completed' && (
              <span className="text-green-400">Complete</span>
            )}
            {transfer.status === 'cancelled' && (
              <span className="text-red-400">Failed</span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}