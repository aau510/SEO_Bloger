#!/bin/bash
# 文件名：test-dify-connectivity.sh
# 用途：测试服务器是否能访问Dify API

echo "🧪 测试服务器访问 Dify API 的能力..."
echo ""

# 测试基本连通性
echo "1️⃣ 测试基本网络连通性..."
ping -c 3 47.90.156.219
echo ""

# 测试端口连通性
echo "2️⃣ 测试端口连通性..."
timeout 10 bash -c "</dev/tcp/47.90.156.219/80" && echo "✅ 端口80连通正常" || echo "❌ 端口80连接失败"
echo ""

# 测试HTTP访问
echo "3️⃣ 测试HTTP访问..."
curl -v --connect-timeout 10 --max-time 30 http://47.90.156.219/v1/health 2>&1 | head -20
echo ""

# 测试Dify API
echo "4️⃣ 测试Dify API访问..."
curl -X POST http://47.90.156.219/v1/workflows/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer app-EVYktrhqnqncQSV9BdDv6uuu" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --connect-timeout 10 \
  --max-time 30 \
  -w "\n响应时间: %{time_total}秒\nHTTP状态码: %{http_code}\n" \
  2>/dev/null
echo ""

# 网络诊断信息
echo "📊 网络诊断信息:"
echo "   本机IP: $(hostname -I | awk '{print $1}')"
echo "   目标服务器: 47.90.156.219"
echo "   测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

echo "🎉 连通性测试完成!"
