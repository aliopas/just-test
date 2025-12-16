/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // Only use app/ directory for App Router
  // Next.js 16 requires app and pages directories to be in the same location
  // The pre-build script removes src/pages to avoid conflicts
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  experimental: {
    optimizePackageImports: ['@tanstack/react-query', '@supabase/supabase-js'],
  },
  // Only use App Router, ignore Pages Router
  // Next.js should automatically use app/ directory when it exists
  // Transpile packages if needed
  transpilePackages: [],
  // Turbopack configuration (Next.js 16 uses Turbopack by default)
  // Explicitly set the workspace root so Turbopack does not try to infer it
  // from multiple lockfiles (repo root + frontend). This also silences the
  // "Next.js inferred your workspace root" warning in Netlify builds and
  // prevents some internal Turbopack bugs.
  turbopack: {
    root: __dirname,
    resolveAlias: {
      '@': './src',
    },
  },
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // ⚠️ IMPORTANT: Next.js rewrites DO NOT WORK in Netlify production builds
  // All API routing must be handled by Netlify redirects in netlify.toml
  // This rewrites() function only works in local development
  async rewrites() {
    // Check if we're running on Netlify (production, preview, or branch deploy)
    const isNetlify = 
      process.env.NETLIFY === 'true' || 
      process.env.CONTEXT === 'production' || 
      process.env.CONTEXT === 'deploy-preview' || 
      process.env.CONTEXT === 'branch-deploy';
    
    // Check if we're in development mode locally
    const isLocalDevelopment = 
      process.env.NODE_ENV === 'development' && 
      !isNetlify;
    
    // In Netlify builds, ALWAYS return empty array - rely on netlify.toml redirects
    if (isNetlify) {
      return [];
    }
    
    // Only in local development: use Next.js rewrites to proxy to local backend
    if (isLocalDevelopment) {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/v1/:path*`,
        },
      ];
    }
    
    // Fallback: no rewrites (for safety)
    return [];
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
    // Optimize package imports
    optimizePackageImports: ['@tanstack/react-query', '@supabase/supabase-js'],
  },
  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  // Output configuration
  // Note: Removed 'standalone' output as it conflicts with Netlify plugin
  // Netlify's @netlify/plugin-nextjs handles Next.js deployment automatically
  // output: 'standalone', // Only needed for Docker/self-hosted deployments
  // For Netlify deployment with Next.js App Router
  // We use dynamic rendering for all pages to avoid SSR issues with React Router components
  // The ClientOnly wrapper ensures components only render on the client
  // The root layout has 'export const dynamic = "force-dynamic"' to prevent static generation
  // All page files should also have 'export const dynamic = "force-dynamic"' for safety
  
  // Disable static page generation for error pages
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  
  // Skip static optimization for error pages
  // This prevents prerendering errors
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

module.exports = nextConfig;
