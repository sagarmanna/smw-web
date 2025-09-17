import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use basePath for subpath deployment. Do not set assetPrefix unless using a CDN.
  // trailingSlash: false,
  basePath: '/admin/v2',
};

export default nextConfig;
