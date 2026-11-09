const APP_STORE_URL = 'https://apps.apple.com/us/app/sonobuddy-pro/id6761020726';
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.sonobuddy.app&hl=en';

const BUTTON =
  'inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white h-9 px-3 sm:px-4 rounded-xl transition-colors text-sm font-semibold';

/**
 * Compact App Store + Google Play buttons for the fixed site header. Icon-only
 * on phones so both fit beside the logo; labeled from the sm breakpoint up.
 */
export default function HeaderStoreButtons() {
  return (
    <div className="flex items-center gap-2">
      <a href={APP_STORE_URL} className={BUTTON} aria-label="Download on the App Store">
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0" aria-hidden="true">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98l-.09.06c-.22.14-2.19 1.28-2.17 3.81.03 3.02 2.65 4.03 2.68 4.04l-.06.17zM13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
        <span className="hidden sm:inline">App Store</span>
      </a>
      <a href={PLAY_STORE_URL} className={BUTTON} aria-label="Get it on Google Play">
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
          <path fill="#00D2FF" d="M3.6 1.8a1.5 1.5 0 0 0-.5 1.15v18.1c0 .46.18.87.5 1.15l.06.06 10.14-10.14v-.24L3.66 1.74l-.06.06z" />
          <path fill="#FFCE00" d="M17.2 15.5l-3.4-3.4v-.24l3.4-3.4.08.05 4.02 2.29c1.15.65 1.15 1.72 0 2.37l-4.02 2.28-.08.05z" />
          <path fill="#FF3A44" d="M17.28 15.45L13.8 11.98 3.6 22.2c.38.4 1 .45 1.71.05l11.97-6.8z" />
          <path fill="#00C853" d="M17.28 8.51L5.31 1.72C4.6 1.31 3.98 1.36 3.6 1.76l10.2 10.22 3.48-3.47z" />
        </svg>
        <span className="hidden sm:inline">Google Play</span>
      </a>
    </div>
  );
}
