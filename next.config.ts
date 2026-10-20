import type { NextConfig } from "next";

// Private-network addresses (192.168.x.x, 10.x.x.x, 172.16–31.x.x), so the dev server
// also works when opened from a phone on the same Wi-Fi. Development only; no effect on builds.
const lanOrigins = [
  "192.168.*.*",
  "10.*.*.*",
  ...Array.from({ length: 16 }, (_, i) => `172.${16 + i}.*.*`),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: lanOrigins,
};

export default nextConfig;
