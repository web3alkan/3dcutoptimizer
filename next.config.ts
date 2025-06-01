import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = '3dcutoptimizer';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  ...(isProd && {
    output: 'export',
    distDir: 'out',
    basePath: `/${repoName}`,
    assetPrefix: `/${repoName}/`,
    trailingSlash: true,
  }),
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
