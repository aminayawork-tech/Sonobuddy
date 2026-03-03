'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  calculators, searchCalculators,
  calcABI, calcResistiveIndex, calcVolume, calcAFI,
  calcGestationalAge, calcEDD, calcThyroidVolume, calcPSVRatio, calcCarotidStenosis,
  type CalcResult,
} from '@/data/calculators';
import clsx from 'clsx';

const RESULT_COLORS: Record<NonNullable<CalcResult['color']>, string> = {
  green: 'bg-green-50 border-green-200 text-green-800',
  amber: 'bg-amber-50 border-amber-200 text-amber-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
};

function CalculatorContent() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get('id');

  const [query, setQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(preselected);
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<CalcResult | null>(null);

  const filtered = useMemo(() => {
    return query ? searchCalculators(query) : calculators;
  }, [query]);

  const activeCalc = calculators.find((c) => c.id === activeId);

  useEffect(() => {
    setInputs({});
    setResult(null);
  }, [activeId]);

  function calculate() {
    if (!activeCalc) return;
    const vals = Object.fromEntries(
      activeCalc.fields.map((f) => [f.id, parseFloat(inputs[f.id] ?? '0') || 0])
    );

    let r: CalcResult = { value: '—', unit: '' };
    switch (activeCalc.id) {
      case 'abi':
        r = calcABI(vals.ankleDP, vals.anklePT, vals.brachialR, vals.brachialL);
        break;
      case 'resistive-index':
        r = calcResistiveIndex(vals.psv, vals.edv);
        break;
      case 'volume-ellipsoid':
        r = calcVolume(vals.length, vals.width, vals.height);
        break;
      case 'afi':
        r = calcAFI(vals.q1, vals.q2, vals.q3, vals.q4);
        break;
      case 'gestational-age-crl':
        r = calcGestationalAge(vals.crl);
        break;
      case 'edd-lmp':
        r = calcEDD(inputs.lmpDate ?? '');
        break;
      case 'thyroid-volume':
        r = calcThyroidVolume(vals.rL, vals.rW, vals.rH, vals.lL, vals.lW, vals.lH);
        break;
      case 'psv-ratio':
        r = calcPSVRatio(vals.psv1, vals.psv2);
        break;
      case 'carotid-stenosis':
        r = calcCarotidStenosis(vals.icaPSV, vals.icaEDV, vals.ccaPSV);
        break;
    }
    setResult(r);
  }

  return (
    <div className="min-h-screen pb-nav">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-sono-dark/95 backdrop-blur-sm border-b border-sono-border">
        <div className="px-4 pt-12 pb-3">
          <h1 className="text-xl font-bold text-slate-900 mb-3">🧮 Calculators</h1>
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveId(null); }}
            placeholder='Search "ABI", "volume", "AFI"…'
            className="w-full bg-sono-card border border-sono-border rounded-xl px-4 py-2.5 text-slate-900 placeholder-sono-muted focus:outline-none focus:border-sono-blue text-sm shadow-sm"
          />
        </div>
      </div>

      {/* Calculator list */}
      {!activeCalc && (
        <div className="px-4 py-4 space-y-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className="w-full bg-sono-card border border-sono-border rounded-2xl p-4 text-left hover:border-sono-blue/50 transition-all active:scale-[0.98]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{c.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                </div>
                <span className="text-sono-muted shrink-0">›</span>
              </div>
              <div className="mt-2">
                <code className="text-[10px] text-sono-blue font-mono bg-blue-50 px-2 py-0.5 rounded">{c.formula}</code>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Active Calculator */}
      {activeCalc && (
        <div className="px-4 py-4">
          <button
            onClick={() => { setActiveId(null); setResult(null); }}
            className="inline-flex items-center gap-1 text-sono-blue text-sm mb-4 hover:underline"
          >
            ← All Calculators
          </button>

          <div className="bg-sono-card border border-sono-border rounded-2xl p-4 mb-4">
            <h2 className="font-bold text-slate-900 text-lg mb-1">{activeCalc.name}</h2>
            <p className="text-xs text-slate-500 mb-3">{activeCalc.description}</p>
            <code className="text-[11px] text-sono-blue font-mono bg-blue-50 px-2 py-1 rounded block">{activeCalc.formula}</code>
          </div>

          {/* Input fields */}
          <div className="space-y-3 mb-4">
            {activeCalc.fields.map((field) => (
              <div key={field.id} className="bg-sono-card border border-sono-border rounded-xl p-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {field.label}
                  <span className="text-sono-muted font-normal ml-1">({field.unit})</span>
                </label>
                {field.unit === 'date' ? (
                  <input
                    type="date"
                    value={inputs[field.id] ?? ''}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    className="w-full bg-transparent border border-sono-border rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-sono-blue"
                  />
                ) : (
                  <input
                    type="number"
                    inputMode="decimal"
                    value={inputs[field.id] ?? ''}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [field.id]: e.target.value }))}
                    placeholder={field.placeholder}
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 'any'}
                    className="w-full bg-transparent border border-sono-border rounded-lg px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-sono-blue placeholder-sono-muted"
                  />
                )}
                {field.hint && <p className="text-[11px] text-sono-muted mt-1">{field.hint}</p>}
              </div>
            ))}
          </div>

          <button
            onClick={calculate}
            className="w-full bg-sono-blue hover:bg-sky-500 text-white font-semibold py-3.5 rounded-xl transition-colors active:scale-95 text-sm"
          >
            Calculate
          </button>

          {result && result.value !== '—' && (
            <div className={clsx('mt-4 border rounded-2xl p-4', RESULT_COLORS[result.color ?? 'blue'])}>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">Result</p>
              <p className="text-3xl font-bold mb-1">
                {result.value} <span className="text-lg opacity-70">{result.unit}</span>
              </p>
              {result.interpretation && (
                <p className="text-sm font-medium mt-1">{result.interpretation}</p>
              )}
              {activeCalc.reference && (
                <p className="text-[11px] opacity-50 mt-2">Ref: {activeCalc.reference}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CalculatorsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pb-nav flex items-center justify-center"><p className="text-sono-muted">Loading…</p></div>}>
      <CalculatorContent />
    </Suspense>
  );
}
