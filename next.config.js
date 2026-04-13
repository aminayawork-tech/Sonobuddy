/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Static export is required for the iOS app bundle (build-ios.sh sets this).
  // Do NOT set it for Vercel deploys — it breaks API route handlers.
  ...(process.env.NEXT_STATIC_EXPORT === 'true' ? { output: 'export' } : {}),
};

module.exports = nextConfig;
