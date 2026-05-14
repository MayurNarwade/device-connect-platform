import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function Toggle({ enabled, onChange, className }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-12 h-7 rounded-full transition-colors backdrop-blur-sm',
        enabled ? 'bg-accent' : 'bg-gray-300/50',
        className
      )}
    >
      <motion.div
        className="absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md"
        animate={{ x: enabled ? '1.25rem' : '0' }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}