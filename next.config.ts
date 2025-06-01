import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  ...(isProd && isGitHubPages && {
    output: 'export',
    trailingSlash: true,
    basePath: '/3dcutoptimizer',
    assetPrefix: '/3dcutoptimizer/',
  }),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
