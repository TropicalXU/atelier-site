// next.config.ts
//
// `images.remotePatterns` tells next/image which external domains it is
// allowed to load images from. Each entry must be added explicitly —
// Next.js blocks unknown external image domains by default for security.

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Phase 5: Unsplash editorial photos (local sample data)
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        // Phase 6+: Shopify product images
        // All Shopify store media is served from this CDN domain.
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },
};

export default nextConfig;
