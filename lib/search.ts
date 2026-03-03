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
  measurement: 'bg-blue-900/40 text-blue-300 border-blue-700',
  protocol: 'bg-green-900/40 text-green-300 border-green-700',
  calculator: 'bg-purple-900/40 text-purple-300 border-purple-700',
  pathology: 'bg-red-900/40 text-red-300 border-red-700',
};

export const TYPE_ICONS: Record<SearchResultType, string> = {
  measurement: '📏',
  protocol: '📋',
  calculator: '🧮',
  pathology: '🔬',
};
