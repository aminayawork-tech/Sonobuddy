import clsx from 'clsx';
import { CATEGORY_COLORS, CATEGORY_LABELS, type MeasurementCategory } from '@/data/measurements';

export default function CategoryBadge({ category }: { category: MeasurementCategory }) {
  return (
    <span className={clsx('text-[11px] px-2 py-0.5 rounded-full border font-medium', CATEGORY_COLORS[category])}>
      {CATEGORY_LABELS[category]}
    </span>
  );
}
