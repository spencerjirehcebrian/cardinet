/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true, // Enable server actions (if you are using them)
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
