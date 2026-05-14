import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Input = forwardRef(({ className, ...props }, ref) => (
  <motion.input
    ref={ref}
    whileFocus={{ scale: 1.01 }}
    className={cn(
      'glass-card rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-accent/50 transition-shadow',
      className
    )}
    {...props}
  />
));
Input.displayName = 'Input';
export default Input;