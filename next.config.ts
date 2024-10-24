import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // disable linting in build
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
