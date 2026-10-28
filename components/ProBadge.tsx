import { Lock } from 'lucide-react';

export default function ProBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`pro-badge shrink-0 text-[10px] font-bold tracking-[0.08em] ${className}`}>
      <Lock size={10} strokeWidth={2.75} />
      PRO
    </span>
  );
}
