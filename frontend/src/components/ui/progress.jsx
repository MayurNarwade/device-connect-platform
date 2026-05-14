import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export default function Progress({ value, className }) {
  return (
    <div className={cn('w-full h-2 bg-white/40 rounded-full overflow-hidden backdrop-blur-sm', className)}>
      <motion.div
        className="h-full bg-gradient-to-r from-accent to-purple-400 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      />
    </div>
  );
}