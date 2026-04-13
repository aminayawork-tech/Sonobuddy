import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 text-center">
      <p className="text-sky-500 text-sm font-semibold uppercase tracking-widest mb-3">404</p>
      <h1 className="text-3xl font-black tracking-tight text-gray-900 mb-3">Page not found</h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        This page doesn&apos;t exist. Head back to SonoBuddy to access measurement tables,
        protocols, calculators, and pathology guides.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
      >
        Back to SonoBuddy
      </Link>
    </div>
  );
}
