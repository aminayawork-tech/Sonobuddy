import { measurements, searchMeasurements, type Measurement } from '@/data/measurements';
import { protocols, searchProtocols, type Protocol } from '@/data/protocols';
import { calculators, searchCalculators, type Calculator } from '@/data/calculators';
import { pathologies, searchPathologies, type Pathology } from '@/data/pathologies';

export type SearchResultType = 'measurement' | 'protocol' | 'calculator' | 'pathology';

export type SearchResult = {
  type: SearchResultType;
  id: string;
  name: string;
  subtitle: string;
  href: string;
  tags: string[];
};

export function globalSearch(query: string): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  searchMeasurements(query).forEach((m: Measurement) => {
    results.push({
      type: 'measurement',
      id: m.id,
      name: m.name,
      subtitle: `${m.subcategory ?? m.category} · ${m.ranges[0]?.label ?? ''}`,
      href: `/measurements?id=${m.id}`,
      tags: m.tags,
    });
  });

  searchProtocols(query).forEach((p: Protocol) => {
    results.push({
      type: 'protocol',
      id: p.id,
      name: p.name,
      subtitle: `${p.category} · ${p.duration} · ${p.difficulty}`,
      href: `/protocols/${p.id}`,
      tags: p.tags,
    });
  });

  searchCalculators(query).forEach((c: Calculator) => {
    results.push({
      type: 'calculator',
      id: c.id,
      name: c.name,
      subtitle: c.description.slice(0, 60) + '…',
      href: `/calculators?id=${c.id}`,
      tags: c.tags,
    });
  });

  searchPathologies(query).forEach((p: Pathology) => {
    results.push({
      type: 'pathology',
      id: p.id,
      name: p.name,
      subtitle: `${p.category} · ${p.redFlags.length} red flags`,
      href: `/pathologies?id=${p.id}`,
      tags: p.tags,
    });
  });

  return results;
}

export const TYPE_LABELS: Record<SearchResultType, string> = {
  measurement: 'Measurement',
  protocol: 'Protocol',
  calculator: 'Calculator',
  pathology: 'Pathology',
};

export const TYPE_COLORS: Record<SearchResultType, string> = {
  measurement: 'bg-blue-100 text-blue-700 border-blue-200',
  protocol: 'bg-green-100 text-green-700 border-green-200',
  calculator: 'bg-purple-100 text-purple-700 border-purple-200',
  pathology: 'bg-red-100 text-red-700 border-red-200',
};

export const TYPE_ICONS: Record<SearchResultType, string> = {
  measurement: '📏',
  protocol: '📋',
  calculator: '🧮',
  pathology: '🔬',
};
