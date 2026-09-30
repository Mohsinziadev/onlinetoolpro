import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/** Generated once at build time (static export). */
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // API routes and internal search results shouldn't be crawled or indexed.
        disallow: ["/api/", "/*?q=", "/*&q="],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
