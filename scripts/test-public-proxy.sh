#!/bin/bash
# 文件名：test-public-proxy.sh
# 用途：测试公网代理服务

echo "🌐 测试公网代理服务..."
echo "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 测试一些公网代理服务
echo "1️⃣ 测试cors-anywhere..."
curl -X POST https://cors-anywhere.herokuapp.com/http://47.90.156.219/v1/workflows/run \
  -H "Content-Type: application/json" \
  -H "X-Requested-With: XMLHttpRequest" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --max-time 30
echo ""

echo "2️⃣ 测试allorigins..."
curl -X POST https://api.allorigins.win/raw \
  -H "Content-Type: application/json" \
  -d '{"url":"http://47.90.156.219/v1/workflows/run","method":"POST","headers":{"Content-Type":"application/json","Authorization":"Bearer app-EVYktrhqnqncQSV9BdDv6uuu"},"body":"{\"inputs\":{},\"response_mode\":\"blocking\",\"user\":\"test\"}"}' \
  --max-time 30
echo ""

echo "3️⃣ 测试corsproxy..."
curl -X POST https://corsproxy.io/?http://47.90.156.219/v1/workflows/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer app-EVYktrhqnqncQSV9BdDv6uuu" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --max-time 30
echo ""

echo "🎯 如果这些公网代理服务可以工作，我们可以使用它们作为备选方案"
