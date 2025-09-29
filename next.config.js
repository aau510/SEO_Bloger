/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Netlify 优化配置
  trailingSlash: false,
  output: 'standalone',
  // 移除过时的 experimental.appDir 配置
}

module.exports = nextConfig
