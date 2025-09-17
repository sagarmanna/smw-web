import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use basePath for subpath deployment. Do not set assetPrefix unless using a CDN.
  // trailingSlash: false,
  basePath: '/admin/v2',
  
  // Turbopack configuration to reduce build errors
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // Reduce build errors
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
