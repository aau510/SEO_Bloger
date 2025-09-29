/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  // Netlify 优化配置
  trailingSlash: false,
  // 移除 output: 'standalone' - Netlify不需要
  distDir: '.next',
  // 确保静态导出正确
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
