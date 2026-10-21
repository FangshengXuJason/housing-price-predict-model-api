import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001'}/api/:path*`,
      },
      {
        source: '/health',
        destination: `${process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8001'}/health`,
      },
      {
        source: '/java-api/:path*',
        destination: `${process.env.NEXT_PUBLIC_JAVA_API_URL || 'http://localhost:8002'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
