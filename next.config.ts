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
  output: "export",
  poweredByHeader: false,
  images: {
    // No image optimisation server in a static export.
    unoptimized: true,
  },
};

export default nextConfig;
