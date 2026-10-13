import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // vivian.com's indexed URLs end in a slash (/nursing/travel/, /salary/);
  // keep them identical so existing links and rankings carry over.
  trailingSlash: true,
};

export default nextConfig;
