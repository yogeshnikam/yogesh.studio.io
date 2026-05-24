import type { NextConfig } from "next";
import path from "path";

// Monorepo root — required for Vercel when Root Directory is apps/web
const monorepoRoot = path.join(__dirname, "../..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
};

export default nextConfig;
