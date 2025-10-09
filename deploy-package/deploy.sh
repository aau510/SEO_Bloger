#!/bin/bash
echo "🚀 启动 Dify 代理服务器..."

# 创建日志目录
mkdir -p logs

# 安装依赖
npm install

# 启动服务 (使用 PM2)
if command -v pm2 &> /dev/null; then
    echo "使用 PM2 启动服务..."
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup
else
    echo "使用 Node.js 直接启动服务..."
    nohup node proxy-server.js > logs/app.log 2>&1 &
    echo $! > app.pid
fi

echo "✅ 服务启动完成!"
echo "健康检查: curl http://localhost:3001/health"
