import { cn } from '../../utils/cn';

export default function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-xl bg-gradient-to-r from-white/30 via-white/50 to-white/30 bg-[length:200%_100%]',
        className
      )}
    />
  );
}