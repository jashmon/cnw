import type { NextConfig } from "next";
import { legacyRedirects } from "./src/content/redirects";

// Classic caching model: a static catalogue site, so Cache Components and Partial Prefetching
// (which require each other) are left off. Pages are generated at build time.
// Same condition as src/proxy.ts. While the site is locked, the image optimiser's internal fetches would carry no
// access cookie and be refused, so images are served directly (behind the same cookie check) instead.
const siteLocked = process.env.SITE_LOCKED ? process.env.SITE_LOCKED !== "0" : process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  images: {
    unoptimized: siteLocked,
    qualities: [75, 85],
    formats: ["image/avif", "image/webp"],
  },
  // 301s from the old cnwcom.in / voizlink.in PHP and PDF URLs (05-architecture/redirects).
  async redirects() {
    return legacyRedirects;
  },
};

export default nextConfig;
