import Link from 'next/link';

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
};

export default function PageHeader({ title, subtitle, backHref, backLabel }: Props) {
  return (
    <div className="px-4 pt-14 pb-4">
      {backHref && (
        <Link href={backHref} className="inline-flex items-center gap-1 text-sono-blue text-sm mb-3 hover:underline">
          ← {backLabel ?? 'Back'}
        </Link>
      )}
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {subtitle && <p className="text-sono-muted text-sm mt-1">{subtitle}</p>}
    </div>
  );
}
