#!/bin/bash
# 文件名：debug-current-config.sh
# 用途：调试当前配置

echo "🔍 调试当前配置..."
echo "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "1️⃣ 检查代理服务器状态..."
curl -s http://10.61.197.191:3001/health | python3 -m json.tool
echo ""

echo "2️⃣ 测试代理服务器API..."
curl -X POST http://10.61.197.191:3001/api/dify-proxy \
  -H "Content-Type: application/json" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --max-time 10
echo ""

echo "3️⃣ 检查Netlify网站..."
curl -s https://seoblog.netlify.app/ | grep -o "<title>.*</title>"
echo ""

echo "4️⃣ 检查环境变量..."
echo "   NEXT_PUBLIC_API_BASE_URL: /api/dify-proxy"
echo "   DIFY_PROXY_URL: http://10.61.197.191:3001/api/dify-proxy"
echo ""

echo "5️⃣ 测试Next.js API路由..."
curl -X POST https://seoblog.netlify.app/api/dify-proxy \
  -H "Content-Type: application/json" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --max-time 30
echo ""

echo "🎯 问题分析："
echo "   - 如果仍然返回ETIMEDOUT 47.90.156.219，说明Next.js API路由没有更新"
echo "   - 如果返回代理服务器错误，说明配置正确但代理服务器有问题"
echo "   - 如果返回成功，说明一切正常"
echo ""

echo "🔧 可能的解决方案："
echo "   1. 等待更长时间让Netlify完成部署"
echo "   2. 清除Netlify缓存"
echo "   3. 检查环境变量是否正确设置"
echo "   4. 使用不同的API端点"
