import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AppStoreBadge from '@/components/AppStoreBadge';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { Calendar, ArrowLeft, Tag } from 'lucide-react';

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

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

          {/* Back */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-sky-500 transition-colors mb-8"
          >
            <ArrowLeft size={14} />
            All posts
          </Link>

          {/* Meta */}
          <div className="mb-8">
            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(post.date)}
              </span>
              <span>·</span>
              <span>{post.author}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 mb-4 leading-tight">
              {post.title}
            </h1>
            <p className="text-gray-500 text-lg leading-relaxed mb-5">{post.excerpt}</p>
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
          </div>

          <hr className="border-gray-100 mb-8" />

          {/* Content */}
          <div className="prose prose-gray prose-lg max-w-none
            prose-headings:font-black prose-headings:tracking-tight prose-headings:text-gray-900
            prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-5 prose-h2:pb-3 prose-h2:border-b prose-h2:border-gray-100
            prose-h3:text-xl prose-h3:mt-10 prose-h3:mb-4
            prose-p:text-gray-600 prose-p:leading-[1.85] prose-p:text-[17px]
            prose-a:text-sky-500 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:text-gray-600 prose-ul:my-5 prose-ul:space-y-2
            prose-ol:text-gray-600 prose-ol:my-5 prose-ol:space-y-2
            prose-li:text-[16px] prose-li:leading-relaxed
            prose-table:text-sm prose-table:w-full
            prose-thead:bg-gray-50
            prose-th:text-gray-900 prose-th:font-semibold prose-th:px-4 prose-th:py-3
            prose-td:text-gray-600 prose-td:px-4 prose-td:py-3
            prose-blockquote:border-l-4 prose-blockquote:border-sky-400 prose-blockquote:bg-sky-50 prose-blockquote:rounded-r-xl prose-blockquote:px-5 prose-blockquote:py-4 prose-blockquote:text-gray-600 prose-blockquote:not-italic
            prose-code:text-sky-600 prose-code:bg-sky-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-medium prose-code:before:content-none prose-code:after:content-none
            prose-hr:border-gray-200 prose-hr:my-10
            prose-img:rounded-2xl prose-img:shadow-md
          ">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>

          {/* CTA */}
          <div className="mt-16 bg-sky-50 border border-sky-100 rounded-2xl p-6 text-center">
            <p className="text-gray-700 font-semibold mb-2">Get SonoBuddy</p>
            <p className="text-gray-500 text-sm mb-4">All reference tools in one app — works offline, built for the scan room.</p>
            <AppStoreBadge />
          </div>
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
