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

  // Webpack configuration for better chunk stability
  // Note: This is ignored when using Turbopack (dev mode), but applies to production builds
  webpack: (config, { isServer }) => {
    // Only apply to client-side bundles (production builds use webpack)
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      };
    }
    return config;
  },

  // Cache headers for chunks to prevent stale chunk issues
  async headers() {
    return [
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
