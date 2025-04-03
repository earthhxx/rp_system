// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true, // เปิด React strict mode
  eslint: {
    ignoreDuringBuilds: true, // ข้ามข้อผิดพลาด ESLint ระหว่างการ build
  },
};

export default nextConfig;
