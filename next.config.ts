import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // Enable static exports
  images: {
    unoptimized: true // Required for static export
  },
  trailingSlash: true, // Recommended for static exports
  // disable linting in build
  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
