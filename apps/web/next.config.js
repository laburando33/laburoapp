const { withExpo } = require('@expo/next-adapter');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['expo', 'react-native'],

  images: {
    domains: [
      // Agregá tu dominio de supabase para que `next/image` no rompa
      "nudoblsyqwjnrsjdauxk.supabase.co",
      "ui-avatars.com",
    ],
  },

  webpack(config) {
    config.resolve.alias['react-native$'] = 'react-native-web';
    return config;
  },

  reactStrictMode: true,

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
  }
};

module.exports = withExpo(nextConfig);
