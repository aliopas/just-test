/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Only use App Router, ignore Pages Router
  // Next.js should automatically use app/ directory when it exists
  // Transpile packages if needed
  transpilePackages: [],
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Rewrite API calls to backend
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/v1/:path*`,
      },
    ];
  },
  // Headers configuration
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Skip static generation for pages that use client-side features
  // This prevents SSR errors during build
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  // Disable static optimization to prevent SSR errors with client-side features
  // Use 'export' for static export (Netlify compatible) but ensure pages are dynamic
  // Remove output setting to allow Next.js to handle routing properly
  // output: 'standalone',
};

module.exports = nextConfig;
