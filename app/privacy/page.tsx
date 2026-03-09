import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — SonoBuddy',
  description: 'SonoBuddy privacy policy. We do not collect, store, or share any personal data.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pb-nav px-5 pt-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sono-blue text-sm mb-6 hover:underline">
        ← Back to SonoBuddy
      </Link>

      <h1 className="text-2xl font-bold text-slate-100 mb-2">Privacy Policy</h1>
      <p className="text-xs text-sono-muted mb-8">Last updated: March 2026</p>

      <div className="space-y-6 text-sm text-slate-300 leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-slate-100 mb-2">Overview</h2>
          <p>
            SonoBuddy (&ldquo;the App&rdquo;) is a free clinical reference tool for sonographers.
            We are committed to protecting your privacy. This policy explains what data we collect
            (spoiler: almost none) and how the App works.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-100 mb-2">Data We Do Not Collect</h2>
          <ul className="space-y-1.5 list-none">
            {[
              'No account or registration is required',
              'No personal information is collected',
              'No patient data is entered, stored, or transmitted',
              'No usage analytics or behavioral tracking',
              'No advertising identifiers',
              'No location data',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-sono-green shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-100 mb-2">How the App Works</h2>
          <p>
            All clinical content (measurements, protocols, calculators, and pathologies) is bundled
            statically with the App. No data is sent to any server when you use the reference
            features or calculators. The App functions fully offline once installed as a PWA.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-100 mb-2">Local Storage</h2>
          <p>
            The App may use your device&apos;s local storage or service worker cache solely to
            enable offline functionality. This data never leaves your device and contains only
            app code and content — never any personal or patient information.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-100 mb-2">Third-Party Services</h2>
          <p>
            The App is hosted on Vercel. When you first load the App, standard web server logs
            (IP address, browser type, timestamp) may be recorded by Vercel as part of normal
            hosting infrastructure. SonoBuddy does not access or use these logs.
            See <a href="https://vercel.com/legal/privacy-policy" className="text-sono-blue underline" target="_blank" rel="noopener noreferrer">Vercel&apos;s Privacy Policy</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-100 mb-2">Clinical Disclaimer</h2>
          <p>
            SonoBuddy is a <strong className="text-slate-100">reference tool only</strong> and is
            not intended for direct patient care decisions. All clinical decisions must involve
            the ordering provider and interpreting physician. Do not enter real patient data into
            any calculator field.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-100 mb-2">Children&apos;s Privacy</h2>
          <p>
            SonoBuddy is intended for licensed healthcare professionals and students. It is not
            directed at children under 13 and we do not knowingly collect data from minors.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-100 mb-2">Changes to This Policy</h2>
          <p>
            If we ever change our data practices, we will update this page and change the
            &ldquo;Last updated&rdquo; date above.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-100 mb-2">Contact</h2>
          <p>
            Questions about this privacy policy? Email us at{' '}
            <a href="mailto:privacy@sonobuddy.app" className="text-sono-blue underline">
              privacy@sonobuddy.app
            </a>
          </p>
        </section>

      </div>

      <div className="mt-10 pt-6 border-t border-sono-border">
        <p className="text-xs text-sono-muted text-center">SonoBuddy · Made for sonographers</p>
      </div>
    </div>
  );
}
