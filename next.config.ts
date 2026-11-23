import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ship the /data JSON files with the server code (used before Supabase is connected, and for the one-time import)
  outputFileTracingIncludes: { "/**": ["./data/**/*"] },
  images: {
    // Serve images as plain files (no Vercel image optimizer). Logos and photos load directly.
    unoptimized: true,
  },
};

export default nextConfig;
