import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.evsociety.org',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
