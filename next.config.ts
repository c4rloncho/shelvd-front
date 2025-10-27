import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'svycfmjxbusajsbsixix.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/reader/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' blob: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' blob: data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
