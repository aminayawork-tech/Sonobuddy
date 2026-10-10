'use client';

import { X } from 'lucide-react';
import Image from 'next/image';

/**
 * Full-screen static image viewer — no pinch/pan gesture handling. An
 * earlier version added custom touch-zoom here, but the touch-event
 * handling interfered with WKWebView's own gesture recognizers and made
 * the whole app pinch-zoomable, not just this image. Opened via double-tap
 * at the call site instead, so there's no in-viewer gesture to conflict
 * with anything.
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
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="w-7 h-7" />
      </button>
      <div className="relative w-full max-w-lg max-h-[75vh]" onClick={(e) => e.stopPropagation()}>
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          unoptimized
          className="rounded-xl object-contain w-full max-h-[75vh] mx-auto"
        />
      </div>
      {caption && <p className="text-white/80 text-sm mt-3 text-center max-w-sm">{caption}</p>}
      {credit && <p className="text-white/40 text-[11px] mt-1 text-center max-w-sm">{credit}</p>}
    </div>
  );
}
