import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "svycfmjxbusajsbsixix.supabase.co",
        port: "",
        pathname: "/storage/v1/object/sign/**",
      },
      {
        protocol: "https",
        hostname:
          "shelvd.7067ec7eed405b5dd36fb64b2d3954de.r2.cloudflarestorage.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "192.168.1.2",
        port: "4000",
        pathname: "/uploads/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/reader/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "frame-src 'self' blob: data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' blob: data:;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
