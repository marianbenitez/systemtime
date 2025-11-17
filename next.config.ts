import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Deshabilitar Turbopack temporalmente para compilación
  turbo: undefined,
};

export default nextConfig;
