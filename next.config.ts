import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Netlify için statik dosya yolu düzeltmeleri
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
  basePath: '',
};

export default nextConfig;
