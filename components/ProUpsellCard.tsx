import { Check } from 'lucide-react';
import ProBadge from '@/components/ProBadge';

const PRO_PERKS = [
  'Every article, new ones added regularly',
  'Full job listings with company names and apply links',
  'All measurements, protocols, calculators, and pathologies',
];

export default function ProUpsellCard({
  title, subtitle, onUnlock, className = '',
}: {
  title: string;
  subtitle: string;
  onUnlock: () => void;
  className?: string;
}) {
  return (
    <div className={`card p-6 text-center ${className}`}>
      <div className="flex justify-center">
        <ProBadge />
      </div>
      <p className="mt-3 text-[20px] font-black tracking-tight text-slate-900 leading-tight">{title}</p>
      <p className="mt-1.5 text-slate-500 text-[13px] leading-relaxed">{subtitle}</p>
      <ul className="mt-4 space-y-2 text-left">
        {PRO_PERKS.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-snug">
            <Check size={16} strokeWidth={2.5} className="text-emerald-500 shrink-0 mt-px" />
            {perk}
          </li>
        ))}
      </ul>
      <button
        onClick={onUnlock}
        className="mt-5 w-full bg-gradient-to-b from-sky-400 to-sono-blue text-white font-bold text-[15px] py-3.5 rounded-2xl shadow-[0_10px_24px_-10px_rgba(14,165,233,0.75),inset_0_1px_0_rgba(255,255,255,0.3)] transition-transform active:scale-[0.98]"
      >
        Unlock Pro
      </button>
      <p className="mt-2.5 text-[11px] text-slate-400">One-time purchase · No subscription</p>
    </div>
  );
}
