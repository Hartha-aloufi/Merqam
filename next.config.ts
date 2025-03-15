import type { NextConfig } from 'next';

const withPWA = require('next-pwa')({
	dest: 'public',
	disable: process.env.NODE_ENV === 'development',
	register: true,
});

const nextConfig: NextConfig = {
	output: 'standalone',

	// Filtering dev pages from static export (Admin pages)
	pageExtensions:
		process.env.NODE_ENV === 'development'
			? ['tsx', 'ts', 'jsx', 'js', 'dev.tsx', 'dev.ts'] // tsx for pages, ts for api
			: ['tsx', 'ts', 'jsx', 'js'],

	// disable linting in build
	eslint: {
		ignoreDuringBuilds: true,
	},

	typescript: {
		ignoreBuildErrors: true,
	},

	reactStrictMode: false,
};

export default withPWA(nextConfig);
