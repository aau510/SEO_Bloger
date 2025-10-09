#!/bin/bash
# 文件名：test-proxy-server.sh
# 用途：测试代理服务器是否正常工作

echo "🧪 测试代理服务器连接..."
echo ""

# 代理服务器配置
PROXY_SERVER="http://10.61.197.191:3001"
HEALTH_URL="$PROXY_SERVER/health"
PROXY_URL="$PROXY_SERVER/api/dify-proxy"

echo "📋 测试配置:"
echo "   代理服务器: $PROXY_SERVER"
echo "   健康检查: $HEALTH_URL"
echo "   API 代理: $PROXY_URL"
echo ""

# 1. 测试健康检查
echo "1️⃣ 测试健康检查..."
health_response=$(curl -s -w "HTTPSTATUS:%{http_code}" "$HEALTH_URL" 2>/dev/null)
health_status=$(echo $health_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
health_body=$(echo $health_response | sed -e 's/HTTPSTATUS:.*//g')

if [ "$health_status" = "200" ]; then
    echo "✅ 健康检查成功: $health_status"
    echo "   响应: $health_body"
else
    echo "❌ 健康检查失败: $health_status"
    echo "   响应: $health_body"
fi
echo ""

# 2. 测试代理连接
echo "2️⃣ 测试代理连接..."
proxy_response=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$PROXY_URL" \
    -H "Content-Type: application/json" \
    -d '{"inputs":{"url_content":"test content","Keywords":"[{\"keyword\":\"test\",\"difficulty\":50,\"traffic\":1000}]"},"response_mode":"blocking","user":"test"}' \
    2>/dev/null)

proxy_status=$(echo $proxy_response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
proxy_body=$(echo $proxy_response | sed -e 's/HTTPSTATUS:.*//g')

if [ "$proxy_status" = "200" ]; then
    echo "✅ 代理连接成功: $proxy_status"
    echo "   响应: $proxy_body"
elif [ "$proxy_status" = "400" ]; then
    echo "⚠️  代理连接正常但参数错误: $proxy_status"
    echo "   响应: $proxy_body"
    echo "   (这是正常的，说明代理工作正常)"
else
    echo "❌ 代理连接失败: $proxy_status"
    echo "   响应: $proxy_body"
fi
echo ""

# 3. 测试网络延迟
echo "3️⃣ 测试网络延迟..."
start_time=$(date +%s%3N)
curl -s "$HEALTH_URL" > /dev/null
end_time=$(date +%s%3N)
latency=$((end_time - start_time))

echo "📊 网络延迟: ${latency}ms"
echo ""

# 4. 生成测试报告
echo "📊 ===== 代理服务器测试报告 ====="
echo "📅 测试时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo "🎯 代理服务器: $PROXY_SERVER"
echo ""

if [ "$health_status" = "200" ]; then
    echo "✅ 健康检查: 正常"
else
    echo "❌ 健康检查: 失败"
fi

if [ "$proxy_status" = "200" ] || [ "$proxy_status" = "400" ]; then
    echo "✅ 代理连接: 正常"
else
    echo "❌ 代理连接: 失败"
fi

echo "📊 网络延迟: ${latency}ms"
echo ""

# 5. 提供使用建议
echo "💡 使用建议:"
if [ "$health_status" = "200" ] && ([ "$proxy_status" = "200" ] || [ "$proxy_status" = "400" ]); then
    echo "   🎉 代理服务器工作正常！"
    echo "   🚀 可以开始使用新的代理地址"
    echo "   📝 前端配置已更新为: $PROXY_SERVER"
    echo ""
    echo "🔧 下一步操作:"
    echo "   1. 重启开发服务器: npm run dev"
    echo "   2. 测试完整的博客生成流程"
    echo "   3. 验证超时问题是否解决"
else
    echo "   ⚠️  代理服务器可能存在问题"
    echo "   🔍 请检查服务器状态和网络连接"
    echo "   📋 参考部署指南进行故障排除"
fi

echo ""
echo "🎯 测试完成!"
