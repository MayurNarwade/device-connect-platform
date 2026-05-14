import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Button = forwardRef(({ className, children, ...props }, ref) => (
  <motion.button
    ref={ref}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    className={cn(
      'px-6 py-3 rounded-2xl glass-button font-semibold text-accent transition-colors',
      className
    )}
    {...props}
  >
    {children}
  </motion.button>
));
Button.displayName = 'Button';
export default Button;