import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use basePath for subpath deployment. Do not set assetPrefix unless using a CDN.
  basePath: '/admin/v2',
  
  // Reduce build errors
  typescript: {
    ignoreBuildErrors: false,
  },
  
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
