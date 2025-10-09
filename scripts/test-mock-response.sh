#!/bin/bash
# 文件名：test-mock-response.sh
# 用途：测试模拟响应

echo "🎭 测试模拟响应..."
echo "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 等待部署完成
echo "⏳ 等待Netlify部署完成..."
sleep 10

# 测试模拟响应
echo "1️⃣ 测试模拟响应..."
curl -X POST https://seoblog.netlify.app/api/dify-proxy \
  -H "Content-Type: application/json" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --max-time 30
echo ""

echo "2️⃣ 检查响应内容..."
curl -X POST https://seoblog.netlify.app/api/dify-proxy \
  -H "Content-Type: application/json" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --max-time 30 | python3 -m json.tool
echo ""

echo "🎯 如果返回模拟的博客内容，说明配置成功"
echo "🎯 如果仍然返回ETIMEDOUT，说明代码没有更新"
