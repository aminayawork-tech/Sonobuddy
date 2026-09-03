import type { Metadata } from 'next';

// Internal tooling — keep it out of search results and the sitemap.
export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
