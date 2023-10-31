/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 8,
  },
  images: {
    remotePatterns: [
      { hostname: 'picsum.photos' },
      {
        hostname: 'gravatar.com',
        pathname: '/avatar/*',
      },
    ],
  },
}

module.exports = nextConfig
