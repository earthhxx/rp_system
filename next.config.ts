import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    // appDir: true, // Enable the App Router for Next.js
  },
};

export default nextConfig;