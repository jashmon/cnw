import type { NextConfig } from "next";
import { legacyRedirects } from "./src/content/redirects";

// Classic caching model: a static catalogue site, so Cache Components and Partial Prefetching
// (which require each other) are left off. Pages are generated at build time.

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
  },
  // 301s from the old cnwcom.in / voizlink.in PHP and PDF URLs (05-architecture/redirects).
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
