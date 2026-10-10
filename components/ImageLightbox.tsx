'use client';

import { useRef, useState } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

const DOUBLE_TAP_WINDOW_MS = 350;

/**
 * Opened via a single tap on a thumbnail (handled at the call site); once
 * open, double-tapping the image itself expands it from the normal bounded
 * modal to true edge-to-edge full screen (toggles back on a second
 * double-tap). Double-tap is detected via click timestamps, not touch
 * events — an earlier version used real touch-event gesture handling for
 * pinch-zoom here, which interfered with WKWebView's own gesture
 * recognizers and made the whole app pinch-zoomable. Plain clicks avoid
 * that entirely.
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
  const [fullScreen, setFullScreen] = useState(false);
  const lastTapRef = useRef(0);

  function onImageClick(e: React.MouseEvent) {
    e.stopPropagation();
    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_WINDOW_MS) {
      lastTapRef.current = 0;
      setFullScreen((v) => !v);
    } else {
      lastTapRef.current = now;
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
        className={
          fullScreen
            ? 'fixed inset-0'
            : 'relative w-full max-w-lg max-h-[75vh]'
        }
        onClick={onImageClick}
      >
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          unoptimized
          className={
            fullScreen
              ? 'object-contain w-full h-full'
              : 'rounded-xl object-contain w-full max-h-[75vh] mx-auto'
          }
        />
      </div>
      {!fullScreen && caption && (
        <p className="text-white/80 text-sm mt-3 text-center max-w-sm">{caption}</p>
      )}
      {!fullScreen && credit && (
        <p className="text-white/40 text-[11px] mt-1 text-center max-w-sm">{credit}</p>
      )}
    </div>
  );
}
