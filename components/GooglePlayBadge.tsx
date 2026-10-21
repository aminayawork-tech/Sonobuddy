const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.sonobuddy.app&hl=en';

export default function GooglePlayBadge({ className = '' }: { className?: string }) {
  return (
    <a
      href={PLAY_STORE_URL}
      className={`inline-flex items-center gap-2.5 bg-black hover:bg-gray-800 text-white px-5 py-3 rounded-xl transition-colors ${className}`}
    >
      {/* Google Play mark */}
      <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <path fill="#00D2FF" d="M3.6 1.8a1.5 1.5 0 0 0-.5 1.15v18.1c0 .46.18.87.5 1.15l.06.06 10.14-10.14v-.24L3.66 1.74l-.06.06z" />
        <path fill="#FFCE00" d="M17.2 15.5l-3.4-3.4v-.24l3.4-3.4.08.05 4.02 2.29c1.15.65 1.15 1.72 0 2.37l-4.02 2.28-.08.05z" />
        <path fill="#FF3A44" d="M17.28 15.45L13.8 11.98 3.6 22.2c.38.4 1 .45 1.71.05l11.97-6.8z" />
        <path fill="#00C853" d="M17.28 8.51L5.31 1.72C4.6 1.31 3.98 1.36 3.6 1.76l10.2 10.22 3.48-3.47z" />
      </svg>
      <div className="text-left">
        <div className="text-[10px] text-gray-300 leading-none mb-0.5">Download on the</div>
        <div className="text-[15px] font-semibold leading-none">Google Play</div>
      </div>
    </a>
  );
}
