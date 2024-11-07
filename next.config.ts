import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
});

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "development" ? "standalone" : 'export',  // We need api route in admin pages, which only used in development
  // Filtering dev pages from static export (Admin pages)
  pageExtensions: process.env.NODE_ENV === "development" ? ['tsx', 'ts', 'jsx', 'js', "dev.tsx"] : ['tsx', 'ts', 'jsx', 'js'],
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

export default withPWA(nextConfig);
