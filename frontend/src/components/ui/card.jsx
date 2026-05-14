import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const Card = forwardRef(({ className, children, hover = true, ...props }, ref) => (
  <motion.div
    ref={ref}
    whileHover={hover ? { scale: 1.02, boxShadow: '0 12px 40px rgba(0,0,0,0.12)' } : {}}
    className={cn('glass-card rounded-3xl p-6', className)}
    {...props}
  >
    {children}
  </motion.div>
));
Card.displayName = 'Card';
export default Card;