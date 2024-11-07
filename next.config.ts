import type { NextConfig } from "next";

const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
});

const nextConfig: NextConfig = {
  output: 'export',  // Enable static exports
  // ... other config
  // webpack: (config) => {
  //   config.externals = [...(config.externals || []), "@mdxeditor/editor"];
  //   return config;
  // },
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
