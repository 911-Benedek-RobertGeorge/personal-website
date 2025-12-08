import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Ensure three and its examples are transpiled for Next/Turbopack
  transpilePackages: ["three"],
};

export default nextConfig;
