import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure asset prefix based on environment
  // Only use /admin/v2 prefix for deployed environments (dev/prod), not local
  assetPrefix: process.env.NEXT_PUBLIC_ENV === 'development' || process.env.NEXT_PUBLIC_ENV === 'production' ? '/admin/v2' : '',
  
  // Ensure static assets are served from the correct path
  trailingSlash: false,
  
  // Don't use basePath - it causes double path issues
  // The routing will be handled by the ingress in deployed environments
  // basePath: '', // Removed to prevent double path issues
};

export default nextConfig;
