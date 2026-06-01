import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ['@shelter-os/db'],
  turbopack: {
    root: path.resolve(__dirname, '../../'),
  },
};

export default nextConfig;
