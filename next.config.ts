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
  webpack: (config, { dev }) => {
    if (dev) {
      // Limit parallel compilation to prevent OOM on memory-constrained machines
      config.parallelism = 1
    }
    return config
  },
};

export default nextConfig;
