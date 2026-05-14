import { motion } from 'framer-motion';
import { useSessionStore } from '../stores/useSessionStore';
import Badge from './ui/badge';

export default function ConnectionIndicator() {
  const { webrtcReady, networkMode, connectionQuality } = useSessionStore();

  const modeLabel = webrtcReady
    ? networkMode || 'P2P'
    : 'Connecting...';
  const variant = webrtcReady
    ? networkMode === 'LAN'
      ? 'success'
      : 'default'
    : 'warning';
  const rtt = connectionQuality?.rtt ? `${connectionQuality.rtt}ms` : '';

  return (
    <div className="flex items-center gap-2">
      <motion.div
        className="w-2.5 h-2.5 rounded-full bg-current"
        animate={{ scale: webrtcReady ? [1, 1.4, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        style={{
          color: webrtcReady
            ? networkMode === 'LAN'
              ? '#00CEC9'
              : '#6C5CE7'
            : '#FDCB6E',
        }}
      />
      <Badge variant={variant}>{modeLabel}</Badge>
      {rtt && <span className="text-xs text-gray-400">{rtt}</span>}
    </div>
  );
}