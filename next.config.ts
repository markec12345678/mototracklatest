import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    '.space-z.ai',
    '.z.ai',
    'localhost',
    '127.0.0.1',
  ],
  turbopack: {},
  webpack: (config, { dev }) => {
    if (dev) {
      config.parallelism = 1
      // Lazy compilation - only compile pages/routes when they're requested
      config.experiments = {
        ...config.experiments,
        lazyCompilation: true,
      }
    }
    return config
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  httpAgentOptions: {
    keepAlive: false,
  },
};

export default nextConfig;
