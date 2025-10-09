#!/bin/bash
# 文件名：test-netlify-proxy.sh
# 用途：测试Netlify网站使用新代理服务器的连接

echo "🧪 测试Netlify网站使用新代理服务器的连接..."
echo "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 等待Netlify部署完成
echo "⏳ 等待Netlify部署完成..."
sleep 30

# 测试代理服务器健康检查
echo "1️⃣ 测试代理服务器健康检查..."
curl -s http://10.61.197.191:3001/health | python3 -m json.tool
echo ""

# 测试代理服务器API端点
echo "2️⃣ 测试代理服务器API端点..."
curl -X POST http://10.61.197.191:3001/api/dify-proxy \
  -H "Content-Type: application/json" \
  -d '{"inputs":{},"response_mode":"blocking","user":"test"}' \
  --max-time 10
echo ""

# 测试Netlify网站
echo "3️⃣ 测试Netlify网站..."
curl -s https://seoblog.netlify.app/ | grep -o "<title>.*</title>"
echo ""

# 测试Netlify网站的环境变量
echo "4️⃣ 检查Netlify环境变量配置..."
echo "   代理服务器: http://10.61.197.191:3001/api/dify-proxy"
echo "   Token: app-EVYktrhqnqncQSV9BdDv6uuu"
echo ""

echo "🎉 测试完成！"
echo ""
echo "📋 下一步操作："
echo "   1. 访问 https://seoblog.netlify.app/"
echo "   2. 测试博客生成功能"
echo "   3. 检查是否使用新的代理服务器"
echo ""
echo "🔍 如果遇到问题，检查："
echo "   - Netlify部署状态: https://app.netlify.com/sites/seoblog/deploys"
echo "   - 代理服务器状态: curl http://10.61.197.191:3001/health"
echo "   - 浏览器开发者工具的网络请求"
