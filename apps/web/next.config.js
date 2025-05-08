// apps/web/next.config.js
const { withExpo } = require('@expo/next-adapter');
const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['expo', 'react-native'],

  images: {
    domains: [
      // Agregá tu dominio de supabase para que `next/image` no rompa
      'nudoblsyqwjnrsjdauxk.supabase.co',
      'ui-avatars.com',
    ],
  },

  webpack(config) {
    // Expo / React Native Web
    config.resolve.alias['react-native$'] = 'react-native-web';
    // Alias @ para que "@/..." apunte a apps/web
    config.resolve.alias['@'] = path.resolve(__dirname);
    return config;
  },

  reactStrictMode: true,

  // las vars públicas que expone Next.js al bundle
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },

  async rewrites() {
    return [
      {
        source: '/api/prompts',
        destination: 'https://extensions.aitopia.ai/ai/prompts',
      },
    ];
  },
};

module.exports = withExpo(nextConfig);
