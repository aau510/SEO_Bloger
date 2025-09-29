/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Netlify 优化配置
  trailingSlash: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 确保API路由正确处理
  experimental: {
    // 移除appDir，使用默认配置
  },
}

module.exports = nextConfig
