'use client';

import { useRef, useState } from 'react';
import { X } from 'lucide-react';

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
const DOUBLE_TAP_WINDOW_MS = 300;

type TouchPoint = { clientX: number; clientY: number };

function distance(a: TouchPoint, b: TouchPoint): number {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

/**
 * Full-screen image viewer with pinch-to-zoom, drag-to-pan once zoomed, and
 * double-tap to toggle zoom — the ultrasound reference images (pathology
 * findings, protocol key images) are often dense/low-contrast and the fixed
 * "fit to screen" view wasn't enough to make out fine detail. No gesture
 * library — this is plain touch-event math, consistent with the rest of the
 * app staying dependency-light.
 *
 * `key={src}` at the call site resets zoom/pan state when the image changes,
 * since the modal itself stays mounted across a lightbox src swap.
 */
export default function ImageLightbox({
  src, alt, caption, credit, onClose,
}: {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  onClose: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const gesture = useRef<{
    mode: 'none' | 'pinch' | 'pan';
    startDistance: number;
    startScale: number;
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
  }>({ mode: 'none', startDistance: 0, startScale: 1, startX: 0, startY: 0, startTx: 0, startTy: 0 });
  const lastTapRef = useRef(0);

  function clampScale(s: number): number {
    return Math.min(MAX_SCALE, Math.max(1, s));
  }

  function resetZoom(): void {
    setScale(1);
    setTx(0);
    setTy(0);
  }

  function toggleZoom(cx: number, cy: number, rect: DOMRect): void {
    if (scale > 1) {
      resetZoom();
      return;
    }
    // Zoom in centered roughly on the tap point rather than always the
    // image's center, so double-tapping a specific detail brings it closer.
    const originX = cx - rect.left - rect.width / 2;
    const originY = cy - rect.top - rect.height / 2;
    setScale(DOUBLE_TAP_SCALE);
    setTx(-originX * (DOUBLE_TAP_SCALE - 1));
    setTy(-originY * (DOUBLE_TAP_SCALE - 1));
  }

  function onTouchStart(e: React.TouchEvent<HTMLDivElement>): void {
    if (e.touches.length === 2) {
      const [a, b] = [e.touches[0], e.touches[1]];
      gesture.current = {
        mode: 'pinch',
        startDistance: distance(a, b),
        startScale: scale,
        startX: 0, startY: 0, startTx: tx, startTy: ty,
      };
      return;
    }
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapRef.current < DOUBLE_TAP_WINDOW_MS) {
        lastTapRef.current = 0;
        const rect = e.currentTarget.getBoundingClientRect();
        toggleZoom(e.touches[0].clientX, e.touches[0].clientY, rect);
        gesture.current.mode = 'none';
        return;
      }
      lastTapRef.current = now;
      gesture.current = {
        mode: scale > 1 ? 'pan' : 'none',
        startDistance: 0, startScale: scale,
        startX: e.touches[0].clientX, startY: e.touches[0].clientY,
        startTx: tx, startTy: ty,
      };
    }
  }

  function onTouchMove(e: React.TouchEvent<HTMLDivElement>): void {
    const g = gesture.current;
    if (g.mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault();
      const [a, b] = [e.touches[0], e.touches[1]];
      const next = clampScale(g.startScale * (distance(a, b) / g.startDistance));
      setScale(next);
      return;
    }
    if (g.mode === 'pan' && e.touches.length === 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - g.startX;
      const dy = e.touches[0].clientY - g.startY;
      setTx(g.startTx + dx);
      setTy(g.startTy + dy);
    }
  }

  function onTouchEnd(e: React.TouchEvent<HTMLDivElement>): void {
    if (e.touches.length === 0) {
      gesture.current.mode = 'none';
      if (scale <= 1.02) resetZoom();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white z-10"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-7 h-7" />
      </button>

      <div
        className="relative w-full max-w-lg max-h-[75vh] overflow-hidden touch-none select-none"
        style={{ touchAction: 'none' }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Plain <img>, not next/image — the scale/translate transform needs
            to apply to the rendered pixel box directly, and this view is
            already a non-optimized, full-resolution display. */}
        <img
          src={src}
          alt={alt}
          className="rounded-xl object-contain w-full max-h-[75vh] mx-auto"
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            transition: gesture.current.mode === 'none' ? 'transform 150ms ease-out' : 'none',
          }}
          draggable={false}
        />
      </div>

      {scale === 1 && (
        <>
          {caption && <p className="text-white/80 text-sm mt-3 text-center max-w-sm">{caption}</p>}
          {credit && <p className="text-white/40 text-[11px] mt-1 text-center max-w-sm">{credit}</p>}
          <p className="text-white/30 text-[11px] mt-2 text-center">Pinch or double-tap to zoom</p>
        </>
      )}
    </div>
  );
}
