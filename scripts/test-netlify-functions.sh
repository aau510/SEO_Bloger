#!/bin/bash
# 文件名：test-netlify-functions.sh
# 用途：测试Netlify Functions是否正确使用代理服务器

echo "🧪 测试Netlify Functions代理配置..."
echo "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 等待Netlify部署完成
echo "⏳ 等待Netlify部署完成..."
sleep 10

# 测试代理服务器
echo "1️⃣ 测试代理服务器健康检查..."
curl -s http://10.61.197.191:3001/health | python3 -m json.tool
echo ""

# 测试代理服务器API
echo "2️⃣ 测试代理服务器API端点..."
curl -X POST http://10.61.197.191:3001/api/dify-proxy \
  -H "Content-Type: application/json" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --max-time 10
echo ""

# 测试Netlify Functions
echo "3️⃣ 测试Netlify Functions代理..."
curl -X POST https://seoblog.netlify.app/api/dify-proxy \
  -H "Content-Type: application/json" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --max-time 30
echo ""

# 测试Netlify网站
echo "4️⃣ 测试Netlify网站..."
curl -s https://seoblog.netlify.app/ | grep -o "<title>.*</title>"
echo ""

echo "🎉 测试完成！"
echo ""
echo "📋 如果Netlify Functions仍然返回ETIMEDOUT错误，说明："
echo "   1. Netlify Functions还没有重新部署"
echo "   2. 或者环境变量DIFY_PROXY_URL没有正确设置"
echo ""
echo "🔍 检查方法："
echo "   1. 访问 https://app.netlify.com/sites/seoblog/deploys"
echo "   2. 查看最新的部署状态"
echo "   3. 检查Functions日志"
