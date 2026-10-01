import type { NextConfig } from "next";

/**
 * Fully static, client-side site: `next build` writes plain HTML/CSS/JS to `out/`.
 * No server, API routes or database — deploy anywhere static, including Vercel.
 *
 * Redirects and security headers live in vercel.json (static export doesn't run them).
 */
// Canonicals, the sitemap and social tags are built from the site URL. A production build
// pointed at localhost would publish broken canonicals, so say so loudly.
if (process.env.NODE_ENV === "production" && /localhost|127\.0\.0\.1/.test(process.env.NEXT_PUBLIC_SITE_URL ?? "")) {
  console.warn(`\n⚠️  NEXT_PUBLIC_SITE_URL is ${process.env.NEXT_PUBLIC_SITE_URL} — canonical URLs and the sitemap will point there. Unset it for a production build.\n`);
}

const nextConfig: NextConfig = {
  // Static export for builds only. In `next dev`, export mode turns every unknown
  // URL (an old tab, a removed tool) into a "missing param in generateStaticParams"
  // error instead of the normal 404 page; without it, dev shows the 404 like production.
  output: process.env.NODE_ENV === "production" ? "export" : undefined,
  poweredByHeader: false,
  images: {
    // No image optimisation server in a static export.
    unoptimized: true,
  },
};

export default nextConfig;
