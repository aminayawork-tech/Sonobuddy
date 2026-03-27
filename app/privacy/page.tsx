import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — SonoBuddy',
  description: 'Privacy policy for SonoBuddy Pro — what data we collect and how we use it.',
};

const LAST_UPDATED = 'March 24, 2026';
const CONTACT_EMAIL = 'support@sonobuddy.com';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-slate-100 mb-2">{title}</h2>
      <div className="space-y-3 text-sm text-slate-400 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-5 pt-12 pb-12 max-w-lg mx-auto">
      <Link href="/" className="inline-flex items-center gap-1 text-sono-blue text-sm mb-6 hover:underline">
        ← Back to SonoBuddy
      </Link>

      <h1 className="text-2xl font-bold text-slate-100 mb-1">Privacy Policy</h1>
      <p className="text-xs text-sono-muted mb-8">Last updated: {LAST_UPDATED}</p>

      {/* Summary banner */}
      <div className="bg-sono-blue/10 border border-sono-blue/30 rounded-xl p-4 mb-8">
        <p className="text-sm text-sono-blue leading-relaxed">
          <strong>Short version:</strong> SonoBuddy Pro is a clinical reference tool. We do not require
          an account, we do not sell your data, and we do not share your personal information with
          third parties for advertising. We may collect anonymous usage analytics to improve the app.
        </p>
      </div>

      <div className="text-sm text-slate-400 leading-relaxed">

        <Section title="1. Who We Are">
          <p>
            SonoBuddy Pro is operated by SonoBuddy (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). We provide a mobile
            reference application for sonographers and ultrasound technologists. Our website is{' '}
            <span className="text-slate-200">sonobuddy.com</span>.
          </p>
          <p>
            Questions about this policy? Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sono-blue hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>
            <span className="text-slate-200 font-medium">No account required.</span> SonoBuddy Pro does
            not require you to create an account. You can use all core features without providing any
            personal information.
          </p>
          <p>
            <span className="text-slate-200 font-medium">Support contact.</span> If you email us for
            support, we receive your name and email address solely to respond to your inquiry.
          </p>
          <p>
            <span className="text-slate-200 font-medium">Usage analytics.</span> We use Google Analytics
            to collect anonymous, aggregated data about how users interact with the app — such as which
            features are used and session duration. This data does not identify you personally and is
            used only to improve the app.
          </p>
          <p>
            <span className="text-slate-200 font-medium">Device information.</span> Standard technical
            data such as device type, OS version, and IP address may be received for security and
            compatibility purposes.
          </p>
          <p>
            <span className="text-slate-200 font-medium">We do not collect:</span> your medical records,
            patient data, precise location, financial information, or any clinical queries you perform
            within the app. All clinical reference content is stored locally on your device.
          </p>
        </Section>

        <Section title="3. What We Don't Collect">
          <ul className="space-y-1.5 list-none">
            {[
              'Patient data of any kind',
              'Real patient information entered into calculators',
              'Location data',
              'Advertising identifiers',
              'Financial or payment information',
              'Health records',
            ].map((item) => (
              <li key={item} className="flex gap-2">
                <span className="text-sono-green shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="4. How We Use Your Information">
          <ul className="space-y-1.5 list-disc pl-4">
            <li>To operate and improve SonoBuddy Pro</li>
            <li>To respond to support requests you initiate</li>
            <li>To understand aggregate usage patterns and fix bugs</li>
            <li>To ensure the security and integrity of the app</li>
          </ul>
          <p>We do not use your information for targeted advertising.</p>
        </Section>

        <Section title="5. How the App Works">
          <p>
            All clinical content — measurements, protocols, calculators, and pathologies — is bundled
            statically with the app. No clinical data is sent to any server when you use the reference
            features or calculators. The app functions fully offline once installed.
          </p>
        </Section>

        <Section title="6. Sharing of Information">
          <p>
            We do not sell, rent, or trade your personal information. We may share limited data in
            these circumstances:
          </p>
          <ul className="space-y-1.5 list-disc pl-4">
            <li>
              <span className="text-slate-200 font-medium">Service providers:</span> Google Analytics
              processes anonymous usage data on our behalf under their privacy terms. Vercel (our
              hosting provider) may log standard server access data.
            </li>
            <li>
              <span className="text-slate-200 font-medium">Legal requirements:</span> We may disclose
              information if required by law or to protect the safety of our users.
            </li>
            <li>
              <span className="text-slate-200 font-medium">Business transfer:</span> If SonoBuddy is
              acquired or merges, your information may be transferred as part of that transaction.
            </li>
          </ul>
        </Section>

        <Section title="7. Local Storage">
          <p>
            The app may use your device&apos;s local storage or service worker cache solely to enable
            offline functionality. This data never leaves your device and contains only app code and
            content — never any personal or patient information.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            SonoBuddy Pro is intended for licensed healthcare professionals and students 17 years of
            age and older. We do not knowingly collect personal information from children under&nbsp;13.
            If you believe a child has provided us personal information, contact us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sono-blue hover:underline">{CONTACT_EMAIL}</a>{' '}
            and we will delete it promptly.
          </p>
        </Section>

        <Section title="9. Your Rights">
          <p>
            You may request access to, correction of, or deletion of any personal data we hold about
            you by emailing{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sono-blue hover:underline">{CONTACT_EMAIL}</a>.
            You may opt out of Google Analytics via{' '}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sono-blue hover:underline"
            >
              Google&apos;s opt-out tool
            </a>.
          </p>
        </Section>

        <Section title="10. Clinical Disclaimer">
          <p>
            SonoBuddy Pro is a <span className="text-slate-200 font-medium">reference tool only</span> and
            is not a medical device, diagnostic tool, or substitute for clinical judgment. All clinical
            decisions must involve the ordering provider and interpreting physician. Do not enter real
            patient data into any calculator field.
          </p>
        </Section>

        <Section title="11. Changes to This Policy">
          <p>
            If we change our data practices, we will update this page and the &ldquo;Last
            updated&rdquo; date above. Continued use of the app after changes constitutes acceptance
            of the updated policy.
          </p>
        </Section>

        <Section title="12. Contact">
          <p>
            Questions about this privacy policy? Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-sono-blue hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
        </Section>

      </div>

      <div className="mt-10 pt-6 border-t border-sono-border">
        <p className="text-xs text-sono-muted text-center">SonoBuddy · Made for sonographers</p>
      </div>
    </div>
  );
}
