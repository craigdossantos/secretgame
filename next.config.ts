import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/secret-game',
  assetPrefix: '/secret-game',
  trailingSlash: true,
  output: 'standalone'
};

export default nextConfig;
