import type { NextConfig } from "next";

// Force rebuild 1
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
