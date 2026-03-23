import Navigation from '@/components/Navigation';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="max-w-lg mx-auto relative">
        {children}
      </main>
      <div className="max-w-lg mx-auto">
        <Navigation />
      </div>
    </>
  );
}
