import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import { Calendar, Tag, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Sonography tips, protocol guides, clinical reference articles, and updates from the SonoBuddy team.',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="text-xl font-black tracking-tight">
            <span className="text-gray-900">Sono</span><span className="text-sky-500">Buddy</span>
          </Link>
          <Link
            href="/home"
            className="bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            Open App
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-20 px-5">
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mb-12">
            <p className="text-sky-500 text-sm font-semibold uppercase tracking-widest mb-3">From the team</p>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-3">Blog</h1>
            <p className="text-gray-500 text-lg">
              Sonography tips, protocol guides, and clinical reference articles.
            </p>
          </div>

          {/* Posts */}
          {posts.length === 0 ? (
            <p className="text-gray-400">No posts yet — check back soon.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
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
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-5 bg-white">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black tracking-tight">
            <span className="text-gray-900">Sono</span><span className="text-sky-500">Buddy</span>
          </Link>
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} SonoBuddy · For reference only. Not a diagnostic tool.
          </p>
        </div>
      </footer>
    </div>
  );
}
