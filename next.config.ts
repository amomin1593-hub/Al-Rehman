import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images as plain files (no Vercel image optimizer). Logos and photos load directly.
    unoptimized: true,
  },
};

export default nextConfig;
