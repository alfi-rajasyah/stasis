/** @type {import('next').NextConfig} */
import withPWAInit from "next-pwa";

const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
};

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPWA(nextConfig);
