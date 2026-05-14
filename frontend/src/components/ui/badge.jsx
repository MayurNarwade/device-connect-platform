import { cn } from '../../utils/cn';

export default function Badge({ children, variant = 'default', className }) {
  const variants = {
    default: 'bg-accent/20 text-accent',
    success: 'bg-success/20 text-success',
    warning: 'bg-yellow-200/50 text-yellow-700',
    error: 'bg-error/20 text-error',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium backdrop-blur-sm',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}