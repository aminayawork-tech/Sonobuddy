/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Collecting data for 170+ blog/article pages can exceed the 60s default
  // on slower disks (e.g. an iCloud-synced checkout), failing the build.
  staticPageGenerationTimeout: 300,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Static export is required for the iOS app bundle (build-ios.sh sets this).
  // Do NOT set it for Vercel deploys — it breaks API route handlers.
  ...(process.env.NEXT_STATIC_EXPORT === 'true' ? {
    output: 'export',
    // Silence the fatal error from the push/send API route during static export.
    // That route is server-only and intentionally absent from the iOS bundle.
    onDemandEntries: { maxInactiveAge: 0 },
  } : {}),
};

module.exports = nextConfig;
