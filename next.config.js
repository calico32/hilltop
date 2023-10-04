/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    cpus: 8,
  },
}

module.exports = nextConfig
