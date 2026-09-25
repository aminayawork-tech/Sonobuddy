import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import AppStoreBadge from '@/components/AppStoreBadge';
import BlogListClient from '@/components/BlogListClient';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Sonography tips, protocol guides, clinical reference articles, and updates from the SonoBuddy team.',
};

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
          <AppStoreBadge />
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
          <BlogListClient posts={posts} />
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
