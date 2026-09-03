import Navigation from '@/components/Navigation';
import DesktopSidebar from '@/components/DesktopSidebar';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import TapTracker from '@/components/TapTracker';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerRegistrar />
      <TapTracker />
      <DesktopSidebar />
      <main className="max-w-lg mx-auto relative lg:ml-60 lg:max-w-2xl lg:mx-0">
        {children}
      </main>
      <Navigation />
    </>
  );
}
