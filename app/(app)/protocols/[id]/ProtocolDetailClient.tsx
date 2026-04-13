'use client';

import { protocols, DIFFICULTY_COLORS } from '@/data/protocols';
import Link from 'next/link';
import clsx from 'clsx';
import { useState } from 'react';
import { Clock, Zap, ChevronDown, Copy, Check } from 'lucide-react';

export default function ProtocolDetailClient({ id }: { id: string }) {
  const protocol = protocols.find((p) => p.id === id);
  const [activeTab, setActiveTab] = useState<'steps' | 'images' | 'report'>('steps');
  const [expandedTemplate, setExpandedTemplate] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  function copyTemplate(text: string, index: number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    });
  }

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
        <h1 className="text-xl font-bold text-slate-900 mb-2">{protocol.name}</h1>
        <div className="flex items-center gap-2 flex-wrap text-xs text-sono-muted">
          <span className={clsx('px-2 py-0.5 rounded border font-medium', DIFFICULTY_COLORS[protocol.difficulty])}>
            {protocol.difficulty}
          </span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {protocol.duration}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {protocol.probe}</span>
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-4 pt-4 grid grid-cols-1 gap-2">
        <div className="bg-sono-card border border-sono-border rounded-xl p-3">
          <p className="text-[11px] font-semibold text-sono-blue uppercase tracking-wide mb-1">Patient Position</p>
          <p className="text-xs text-slate-700">{protocol.patient}</p>
        </div>
        <div className="bg-sono-card border border-sono-border rounded-xl p-3">
          <p className="text-[11px] font-semibold text-sono-blue uppercase tracking-wide mb-1">Indications</p>
          <p className="text-xs text-slate-700">{protocol.indication}</p>
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
                  : 'text-sono-muted border-transparent hover:text-slate-700'
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
              <h3 className="font-semibold text-slate-900 text-sm">{step.title}</h3>
            </div>
            <div className="px-4 py-3 space-y-3">
              <p className="text-xs text-slate-700 leading-relaxed">{step.description}</p>
              {step.probe && (
                <p className="text-xs text-sono-muted italic flex items-center gap-1"><Zap className="w-3 h-3 shrink-0" /> {step.probe}</p>
              )}
              {step.tips && step.tips.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                  <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">Tips</p>
                  {step.tips.map((tip, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-amber-600 shrink-0 text-xs mt-0.5">→</span>
                      <p className="text-xs text-amber-800 leading-relaxed">{tip}</p>
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
                <div className="w-6 h-6 rounded-full bg-green-100 border border-green-200 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-green-700">{i + 1}</span>
                </div>
                <p className="text-sm text-slate-700 pt-0.5">{img}</p>
              </div>
            ))}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && (
          <div className="space-y-2">

            {/* Checklist */}
            <p className="text-xs text-sono-muted mb-3">Items to include in your ultrasound report:</p>
            {protocol.reportChecklist.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-sono-card border border-sono-border rounded-xl px-4 py-3">
                <span className="text-sono-blue shrink-0 mt-0.5">☐</span>
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
            {protocol.commonFindings.length > 0 && (
              <>
                <p className="text-xs font-semibold text-sono-muted uppercase tracking-wide mt-4 mb-2">Common Findings</p>
                {protocol.commonFindings.map((finding, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                    <span className="text-slate-600">•</span> {finding}
                  </div>
                ))}
              </>
            )}

            {/* Report Templates */}
            {protocol.reportTemplates && protocol.reportTemplates.length > 0 && (
              <>
                <div className="pt-2 pb-1 border-t border-sono-border/50 mt-4" />
                <p className="text-[11px] font-semibold text-sono-blue uppercase tracking-wide mb-2">Report Templates</p>
                <p className="text-xs text-sono-muted mb-3">Tap a template to expand. Replace blanks (___) with your measured values.</p>
                {protocol.reportTemplates.map((template, i) => (
                  <div key={i} className="bg-sono-card border border-sono-border rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setExpandedTemplate(expandedTemplate === i ? null : i)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{template.label}</p>
                        <p className="text-xs text-sono-muted mt-0.5">{template.scenario}</p>
                      </div>
                      <ChevronDown className={clsx('w-4 h-4 text-sono-muted shrink-0 transition-transform', expandedTemplate === i && 'rotate-180')} />
                    </button>
                    {expandedTemplate === i && (
                      <div className="border-t border-sono-border bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line mb-3">{template.text}</p>
                        <button
                          onClick={() => copyTemplate(template.text, i)}
                          className="flex items-center gap-1.5 text-xs font-medium text-sono-blue hover:text-cyan-400 transition-colors"
                        >
                          {copiedIndex === i ? (
                            <><Check className="w-3.5 h-3.5 text-sono-green" /><span className="text-sono-green">Copied!</span></>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" />Copy to clipboard</>
                          )}
                        </button>
                      </div>
                    )}
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
