import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use assetPrefix for all environments
  assetPrefix: '/admin/v2',
  trailingSlash: false,
  basePath: '/admin/v2',
};

export default nextConfig;
