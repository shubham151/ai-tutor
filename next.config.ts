import type { NextConfig } from 'next'

const nextConfig = {
  experimental: {
    appDir: true,
  },
  webpack: (config: { resolve: { alias: { canvas: boolean } } }) => {
    config.resolve.alias.canvas = false
    return config
  },
}

export default nextConfig
