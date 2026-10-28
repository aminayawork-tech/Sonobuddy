'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import ImageLightbox from '@/components/ImageLightbox';

/**
 * Markdown image renderer for articles. The markdown title carries
 * "Caption|Credit" — e.g. ![alt](/pathologies/x.jpg "Snowstorm uterus|Wikimedia Commons — Public Domain, Author")
 * — because every image needs its license attribution shown next to it.
 */
export default function ArticleImage({ src, alt, title }: { src?: string; alt?: string; title?: string }) {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  const [caption, credit] = (title ?? '').split('|').map((s) => s.trim());

  return (
    <span className="block my-6 not-prose">
      <button type="button" onClick={() => setOpen(true)} className="block w-full" aria-label={`Enlarge image: ${alt ?? ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt ?? ''}
          loading="lazy"
          className="w-full rounded-2xl bg-black ring-1 ring-slate-900/[0.06] shadow-[0_8px_24px_-12px_rgba(15,23,42,0.3)]"
        />
      </button>
      {(caption || credit) && (
        <span className="block mt-2 px-1 text-[12px] leading-snug text-slate-500">
          {caption}
          {credit && <span className="block text-[11px] text-slate-400 mt-0.5">Image: {credit}</span>}
        </span>
      )}
      {/* Portaled out because markdown wraps images in <p>, and the
          lightbox's <div>s can't legally nest inside one. */}
      {open && createPortal(
        <ImageLightbox src={src} alt={alt ?? ''} caption={caption} credit={credit} onClose={() => setOpen(false)} />,
        document.body,
      )}
    </span>
  );
}
