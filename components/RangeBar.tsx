import clsx from 'clsx';
import { type NormalRange } from '@/data/measurements';

type Props = {
  ranges: NormalRange[];
};

const RANGE_COLORS = [
  'bg-green-50 border-green-200 text-green-700',
  'bg-amber-50 border-amber-200 text-amber-700',
  'bg-red-50 border-red-200 text-red-700',
  'bg-blue-50 border-blue-200 text-blue-700',
];

export default function RangeBar({ ranges }: Props) {
  return (
    <div className="space-y-2">
      {ranges.map((range, i) => (
        <div key={i} className={clsx('rounded-lg border px-3 py-2', RANGE_COLORS[i] ?? RANGE_COLORS[0])}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs font-semibold">{range.label}</span>
            <span className="text-xs font-mono opacity-80">
              {range.min !== undefined && range.max !== undefined
                ? `${range.min}–${range.max} ${range.unit}`
                : range.min !== undefined
                ? `≥ ${range.min} ${range.unit}`
                : range.max !== undefined
                ? `≤ ${range.max} ${range.unit}`
                : range.unit}
            </span>
          </div>
          {range.notes && (
            <p className="text-[11px] opacity-70 mt-0.5">{range.notes}</p>
          )}
        </div>
      ))}
    </div>
  );
}
