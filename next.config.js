/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    cpus: 8,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'picsum.photos',
      },
    ],
  },
}

module.exports = nextConfig
