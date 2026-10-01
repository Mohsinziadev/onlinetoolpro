import type { Metadata, Viewport } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { PageBackdrop } from "@/components/visual/page-backdrop";
import { siteConfig } from "@/lib/site";
import { defaultOgImage } from "@/lib/seo";
import "./globals.css";

// Figtree: a geometric sans close in feel to premium SaaS type (e.g. Euclid Circular), free and variable.
const sans = Figtree({ variable: "--font-sans-face", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `Free Online Tools for Everyday Tasks | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    url: "/",
    title: `Free Online Tools for Everyday Tasks | ${siteConfig.name}`,
    description: siteConfig.description,
    images: [defaultOgImage],
  },
  twitter: { card: "summary_large_image", images: [defaultOgImage] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${geistMono.variable} antialiased`}>
      {/* Browser extensions (Grammarly, ColorZilla…) add attributes to <body> before React loads. This ignores
          attribute differences on <body> only; mismatches in the page content are still reported. */}
      <body className="flex min-h-dvh flex-col" suppressHydrationWarning>
        <Providers>
          <a
            href="#main"
            className="sr-only z-50 rounded-full bg-cta px-4 py-2 text-sm text-cta-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main" className="relative isolate flex-1">
            <PageBackdrop />
            {children}
          </main>
          <SiteFooter />
        </Providers>
      </body>
      {/* Google Analytics (gtag.js), loaded after the page is interactive. Production builds only, so local testing isn't counted. */}
      {process.env.NODE_ENV === "production" && siteConfig.gaId ? <GoogleAnalytics gaId={siteConfig.gaId} /> : null}
    </html>
  );
}
