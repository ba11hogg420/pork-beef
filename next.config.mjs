/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // Reduce bundle size
  modularizeImports: {
    'framer-motion': {
      transform: 'framer-motion/dist/es/{{member}}',
    },
  },
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['framer-motion', '@supabase/supabase-js'],
  },
};

export default nextConfig;
