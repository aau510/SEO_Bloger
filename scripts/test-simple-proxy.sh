#!/bin/bash
# 文件名：test-simple-proxy.sh
# 用途：测试简单的公网代理服务

echo "🌐 测试简单的公网代理服务..."
echo "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 测试一些简单的代理服务
echo "1️⃣ 测试httpbin.org..."
curl -X POST https://httpbin.org/post \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}' \
  --max-time 10
echo ""

echo "2️⃣ 测试jsonplaceholder..."
curl -X POST https://jsonplaceholder.typicode.com/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"test","body":"test","userId":1}' \
  --max-time 10
echo ""

echo "3️⃣ 测试httpbin.org/anything..."
curl -X POST https://httpbin.org/anything \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --max-time 10
echo ""

echo "🎯 如果这些服务可以工作，我们可以使用它们作为测试代理"
