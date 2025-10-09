#!/bin/bash
# 文件名：update-frontend-config.sh
# 用途：更新前端配置使用新的代理服务器

echo "🔧 更新前端配置使用新的代理服务器..."
echo ""

# 新的代理服务器地址
PROXY_SERVER="http://10.61.197.191:3001"

echo "📋 配置更新:"
echo "   新代理地址: $PROXY_SERVER"
echo "   原代理地址: /api/dify-proxy (Netlify)"
echo ""

# 备份原文件
echo "💾 备份原配置文件..."
cp lib/dify-api.ts lib/dify-api.ts.backup
cp .env.local .env.local.backup 2>/dev/null || echo "   .env.local 不存在，跳过备份"

# 更新 lib/dify-api.ts
echo "📝 更新 lib/dify-api.ts..."
sed -i.tmp "s|const DIFY_API_BASE_URL = '/api/dify-proxy'|const DIFY_API_BASE_URL = '$PROXY_SERVER/api/dify-proxy'|g" lib/dify-api.ts
rm lib/dify-api.ts.tmp

# 更新 .env.local
echo "📝 更新 .env.local..."
cat > .env.local << EOF
# 使用新的代理服务器
NEXT_PUBLIC_API_BASE_URL=$PROXY_SERVER/api/dify-proxy
API_AUTHORIZATION_TOKEN=app-EVYktrhqnqncQSV9BdDv6uuu
NEXT_PUBLIC_SITE_NAME=SEO Blog Agent
NEXT_PUBLIC_SITE_DESCRIPTION=AI-powered SEO blog generation system

# 代理服务器配置
PROXY_SERVER_URL=$PROXY_SERVER
DIFY_API_BASE_URL=http://47.90.156.219/v1
DIFY_API_TOKEN=app-EVYktrhqnqncQSV9BdDv6uuu
EOF

# 创建环境变量模板
echo "📝 创建环境变量模板..."
cat > env.proxy.template << EOF
# 代理服务器环境变量模板
NEXT_PUBLIC_API_BASE_URL=$PROXY_SERVER/api/dify-proxy
API_AUTHORIZATION_TOKEN=app-EVYktrhqnqncQSV9BdDv6uuu
NEXT_PUBLIC_SITE_NAME=SEO Blog Agent
NEXT_PUBLIC_SITE_DESCRIPTION=AI-powered SEO blog generation system

# 代理服务器配置
PROXY_SERVER_URL=$PROXY_SERVER
DIFY_API_BASE_URL=http://47.90.156.219/v1
DIFY_API_TOKEN=app-EVYktrhqnqncQSV9BdDv6uuu
EOF

# 更新 netlify.toml (如果需要)
echo "📝 更新 netlify.toml..."
if [ -f "netlify.toml" ]; then
    cp netlify.toml netlify.toml.backup
    # 注释掉原来的代理配置
    sed -i.tmp 's|NEXT_PUBLIC_API_BASE_URL = "/api/dify-proxy"|# NEXT_PUBLIC_API_BASE_URL = "/api/dify-proxy"|g' netlify.toml
    rm netlify.toml.tmp
fi

echo "✅ 前端配置更新完成!"
echo ""
echo "📋 更新内容:"
echo "   ✅ lib/dify-api.ts - 更新代理地址"
echo "   ✅ .env.local - 创建环境变量文件"
echo "   ✅ env.proxy.template - 创建模板文件"
echo "   ✅ netlify.toml - 备份并注释原配置"
echo ""
echo "🔧 配置详情:"
echo "   代理服务器: $PROXY_SERVER"
echo "   API 端点: $PROXY_SERVER/api/dify-proxy"
echo "   健康检查: $PROXY_SERVER/health"
echo ""
echo "🚀 下一步操作:"
echo "1. 重启开发服务器: npm run dev"
echo "2. 测试代理连接是否正常"
echo "3. 验证 Dify API 调用是否成功"
echo ""
echo "🔄 回滚命令 (如果需要):"
echo "   cp lib/dify-api.ts.backup lib/dify-api.ts"
echo "   cp .env.local.backup .env.local"
echo "   cp netlify.toml.backup netlify.toml"
