import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // LouFind stores its demo data in the browser; Vercel needs static HTML,
  // while the existing Cloudflare build keeps its Worker entry point.
  output: process.env.LOUFIND_BUILD_TARGET === 'vercel' ? 'export' : undefined,
};

export default nextConfig;
