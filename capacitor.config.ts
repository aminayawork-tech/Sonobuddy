import type { CapacitorConfig } from '@capacitor/cli';

const isLocal = process.env.CAP_LOCAL === 'true';

const config: CapacitorConfig = {
  appId: 'com.sonobuddy.app',
  appName: 'SonoBuddy',
  webDir: 'out',
  // Load live content from Vercel — no App Store update needed for content changes
  ...(isLocal ? {} : {
    server: {
      url: 'https://www.sonobuddy.com',
      cleartext: false,
    },
  }),
};

export default config;
