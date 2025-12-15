import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone for Docker deployment
  output: "standalone",
  // Enable OpenTelemetry instrumentation
  experimental: {
    instrumentationHook: true,
  },
};

export default nextConfig;
