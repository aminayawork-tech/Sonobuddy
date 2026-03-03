'use client';

import { useParams } from 'next/navigation';
import { protocols, DIFFICULTY_COLORS } from '@/data/protocols';
import Link from 'next/link';
import clsx from 'clsx';
import { useState } from 'react';

export default function ProtocolDetailPage() {
  const params = useParams();
  const protocol = protocols.find((p) => p.id === params.id);
  const [activeTab, setActiveTab] = useState<'steps' | 'images' | 'report'>('steps');

  if (!protocol) {
    return (
      <div className="min-h-screen pb-nav flex items-center justify-center">
        <div className="text-center">
          <p className="text-sono-muted mb-4">Protocol not found</p>
          <Link href="/protocols" className="text-sono-blue text-sm">← Back to Protocols</Link>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'steps' as const, label: `Steps (${protocol.steps.length})` },
    { id: 'images' as const, label: `Images (${protocol.keyImages.length})` },
    { id: 'report' as const, label: `Report (${protocol.reportChecklist.length})` },
  ];

  return (
    <div className="min-h-screen pb-nav">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 border-b border-sono-border">
        <Link href="/protocols" className="inline-flex items-center gap-1 text-sono-blue text-sm mb-3 hover:underline">
          ← Protocols
        </Link>
        <h1 className="text-xl font-bold text-white mb-2">{protocol.name}</h1>
        <div className="flex items-center gap-2 flex-wrap text-xs text-sono-muted">
          <span className={clsx('px-2 py-0.5 rounded border font-medium', DIFFICULTY_COLORS[protocol.difficulty])}>
            {protocol.difficulty}
          </span>
          <span>⏱ {protocol.duration}</span>
          <span>·</span>
          <span>🔬 {protocol.probe}</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-4 pt-4 grid grid-cols-1 gap-2">
        <div className="bg-sono-card border border-sono-border rounded-xl p-3">
          <p className="text-[11px] font-semibold text-sono-blue uppercase tracking-wide mb-1">Patient Position</p>
          <p className="text-xs text-slate-300">{protocol.patient}</p>
        </div>
        <div className="bg-sono-card border border-sono-border rounded-xl p-3">
          <p className="text-[11px] font-semibold text-sono-blue uppercase tracking-wide mb-1">Indications</p>
          <p className="text-xs text-slate-300">{protocol.indication}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 z-30 bg-sono-dark/95 backdrop-blur-sm border-b border-sono-border mt-4">
        <div className="flex px-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex-1 py-3 text-xs font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'text-sono-blue border-sono-blue'
                  : 'text-sono-muted border-transparent hover:text-slate-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3 pb-6">
        {/* Steps Tab */}
        {activeTab === 'steps' && protocol.steps.map((step) => (
          <div key={step.step} className="bg-sono-card border border-sono-border rounded-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-sono-border/50">
              <div className="w-6 h-6 rounded-full bg-sono-blue/20 border border-sono-blue/50 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-sono-blue">{step.step}</span>
              </div>
              <h3 className="font-semibold text-white text-sm">{step.title}</h3>
            </div>
            <div className="px-4 py-3 space-y-3">
              <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
              {step.probe && (
                <p className="text-xs text-sono-muted italic">🔬 {step.probe}</p>
              )}
              {step.tips && step.tips.length > 0 && (
                <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 space-y-1.5">
                  <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide">Tips</p>
                  {step.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-amber-500 shrink-0 text-xs mt-0.5">→</span>
                      <p className="text-xs text-amber-200/80 leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Images Tab */}
        {activeTab === 'images' && (
          <div className="space-y-2">
            <p className="text-xs text-sono-muted mb-3">Required images to document for this exam:</p>
            {protocol.keyImages.map((img, i) => (
              <div key={i} className="flex items-start gap-3 bg-sono-card border border-sono-border rounded-xl px-4 py-3">
                <div className="w-6 h-6 rounded-full bg-green-900/40 border border-green-700/40 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-green-400">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-300 pt-0.5">{img}</p>
              </div>
            ))}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && (
          <div className="space-y-2">
            <p className="text-xs text-sono-muted mb-3">Items to include in your ultrasound report:</p>
            {protocol.reportChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-sono-card border border-sono-border rounded-xl px-4 py-3">
                <span className="text-sono-blue shrink-0 mt-0.5">☐</span>
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
            {protocol.commonFindings.length > 0 && (
              <>
                <p className="text-xs font-semibold text-sono-muted uppercase tracking-wide mt-4 mb-2">Common Findings</p>
                {protocol.commonFindings.map((finding, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="text-slate-600">•</span> {finding}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
