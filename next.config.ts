import type { NextConfig } from "next";

/**
 * Fully static, client-side site: `next build` writes plain HTML/CSS/JS to `out/`.
 * No server, API routes or database — deploy anywhere static, including Vercel.
 *
 * Redirects and security headers live in vercel.json (static export doesn't run them).
 */
const nextConfig: NextConfig = {
  output: "export",
  poweredByHeader: false,
  images: {
    // No image optimisation server in a static export.
    unoptimized: true,
  },
};

export default nextConfig;
