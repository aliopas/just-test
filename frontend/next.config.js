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
  // For Netlify deployment with Next.js App Router
  // We use dynamic rendering for all pages to avoid SSR issues with React Router components
  // The ClientOnly wrapper ensures components only render on the client
  // The root layout has 'export const dynamic = "force-dynamic"' to prevent static generation
  // All page files should also have 'export const dynamic = "force-dynamic"' for safety
};

module.exports = nextConfig;
