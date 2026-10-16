import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // goodwillstaffing.ca's indexed URLs end in a slash; keep them identical so
  // existing links and rankings carry over.
  trailingSlash: true,
  env: {
    // public/media is a local-only copy of the WordPress uploads. On Vercel,
    // until the S3 bucket is set up, serve the same files from the live
    // WordPress site (identical year/month paths). Set NEXT_PUBLIC_MEDIA_URL
    // to the S3 URL to override; this must happen before the domain moves.
    NEXT_PUBLIC_MEDIA_URL:
      process.env.NEXT_PUBLIC_MEDIA_URL || (process.env.VERCEL ? "https://goodwillstaffing.ca/wp-content/uploads" : ""),
  },
  experimental: {
    // With S3 configured, form uploads go straight from the browser to the
    // bucket (src/forms/uploads.ts). Without it they travel with the
    // submission, so keep room for a CV; Vercel caps bodies at 4.5 MB anyway.
    serverActions: { bodySizeLimit: "4mb" },
  },
  async redirects() {
    return [
      // WordPress pages that were stubs, duplicates or plugin artefacts.
      { source: "/about", destination: "/about-us/", permanent: true },
      { source: "/goodwill-blog", destination: "/category/goodwill-blog/", permanent: true },
      { source: "/employer-blog", destination: "/category/employer-blog/", permanent: true },
      { source: "/client-solutions", destination: "/healthcare-staffing-solutions-across-canada/", permanent: true },
      { source: "/faq", destination: "/faqs/", permanent: true },
      { source: "/:territory(nunavut|northwest-territories|yukon)", destination: "/location/", permanent: true },
      { source: "/:page(chatbot-page|wpwbot-mobile-app|goodwill-staffing-and-recruitment)", destination: "/", permanent: true },
      // Old URLs the live site 301s (Yoast/Redirection); links in content point at the targets directly.
      { source: "/contact", destination: "/contact-us/", permanent: true },
      { source: "/events", destination: "/register-travel-nurse-jobs-canada/", permanent: true },
      { source: "/manitoba", destination: "/staffing-solutions-new-brunswick/", permanent: true },
      { source: "/travel-nurse-jobs-in-ontario", destination: "/travel-nursing-jobs-in-ontario/", permanent: true },
      { source: "/travel-nursing-jobs-by-specialty", destination: "/travel-nursing-jobs-by-specialty-in-canada/", permanent: true },
      { source: "/travel-allied-health-jobs-by-specialty", destination: "/travel-allied-health-jobs-by-specialty-2/", permanent: true },
      // WordPress internals and feeds that crawlers still request.
      { source: "/wp-admin/:path*", destination: "/admin/", permanent: false },
      { source: "/wp-login.php", destination: "/admin/", permanent: false },
      { source: "/feed", destination: "/blog/", permanent: true },
      { source: "/:yoast(sitemap_index.xml|page-sitemap.xml|post-sitemap.xml)", destination: "/sitemap.xml", permanent: true },
      { source: "/category/:slug/feed", destination: "/category/:slug/", permanent: true },
      // Old upload URLs (in backlinks and image search) follow the media to S3.
      {
        source: "/wp-content/uploads/:path*",
        destination: `${process.env.NEXT_PUBLIC_MEDIA_URL?.replace(/\/$/, "") ?? "/media"}/:path*`,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
