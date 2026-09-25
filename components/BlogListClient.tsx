'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Tag, ArrowRight, Search } from 'lucide-react';
import { parseLocalDate } from '@/lib/date';
import type { BlogPostMeta } from '@/lib/blog';

function formatDate(dateStr: string) {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogListClient({ posts }: { posts: BlogPostMeta[] }) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const visiblePosts = q
    ? posts.filter((post) =>
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.tags.some((tag) => tag.toLowerCase().includes(q))
      )
    : posts;

  return (
    <>
      <div className="relative mb-8">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles…"
          className="w-full bg-gray-50 text-gray-700 placeholder-gray-400 text-[15px] rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-sky-200 border border-gray-200"
        />
      </div>

      {visiblePosts.length === 0 ? (
        <p className="text-gray-400">
          {q ? 'No posts match your search.' : 'No posts yet — check back soon.'}
        </p>
      ) : (
        <div className="space-y-6">
          {visiblePosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-sky-200 transition-all group"
            >
              <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formatDate(post.date)}
                </span>
                <span>·</span>
                <span>{post.author}</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-sky-600 transition-colors">
                {post.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-sky-50 text-sky-600 text-xs font-medium px-2.5 py-1 rounded-full"
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
                <span className="text-sky-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read <ArrowRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
