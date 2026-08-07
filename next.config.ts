import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Playwright e2e can set NEXT_DIST_DIR=.next-e2e so a second dev server
  // does not fight the manual `pnpm dev` lock under `.next/dev`.
  ...(process.env.NEXT_DIST_DIR
    ? { distDir: process.env.NEXT_DIST_DIR }
    : {}),
};

export default nextConfig;
