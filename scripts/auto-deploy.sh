#!/bin/bash
# 文件名：auto-deploy.sh
# 用途：自动部署到服务器 10.61.153.191

echo "🚀 自动部署 Dify 代理服务器到 10.61.153.191..."
echo ""

# 服务器配置
SERVER_IP="10.61.197.191"
SERVER_USER="Joyme0411!"
SERVER_PASS="liveme@2022"
REMOTE_PATH="/opt/dify-proxy"

# 检查部署包是否存在
if [ ! -d "deploy-package" ]; then
    echo "❌ 部署包不存在，请先运行 deploy-proxy-server.sh"
    exit 1
fi

echo "📋 部署信息:"
echo "   服务器: $SERVER_IP"
echo "   用户: $SERVER_USER"
echo "   远程路径: $REMOTE_PATH"
echo ""

# 使用 sshpass 自动上传文件
echo "📤 上传文件到服务器..."

# 检查是否安装了 sshpass
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass 未安装，请手动上传文件:"
    echo "   scp -r deploy-package/* $SERVER_USER@$SERVER_IP:$REMOTE_PATH/"
    echo ""
    echo "然后 SSH 连接并执行:"
    echo "   ssh $SERVER_USER@$SERVER_IP"
    echo "   cd $REMOTE_PATH"
    echo "   ./deploy.sh"
    exit 1
fi

# 创建远程目录
echo "📁 创建远程目录..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "sudo mkdir -p $REMOTE_PATH && sudo chown $SERVER_USER:$SERVER_USER $REMOTE_PATH"

# 上传文件
echo "📤 上传部署文件..."
sshpass -p "$SERVER_PASS" scp -r -o StrictHostKeyChecking=no deploy-package/* "$SERVER_USER@$SERVER_IP:$REMOTE_PATH/"

# 设置权限
echo "🔧 设置文件权限..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "cd $REMOTE_PATH && chmod +x deploy.sh"

# 安装依赖并启动服务
echo "🚀 安装依赖并启动服务..."
sshpass -p "$SERVER_PASS" ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
cd /opt/dify-proxy

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 安装 PM2 (如果未安装)
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

# 启动服务
echo "🚀 启动服务..."
./deploy.sh

# 等待服务启动
sleep 5

# 检查服务状态
echo "🔍 检查服务状态..."
curl -s http://localhost:3001/health || echo "❌ 服务启动失败"

echo "✅ 部署完成!"
EOF

echo ""
echo "🎉 自动部署完成!"
echo ""
echo "📋 服务信息:"
echo "   代理地址: http://10.61.153.191:3001"
echo "   健康检查: http://10.61.153.191:3001/health"
echo "   Dify 代理: http://10.61.153.191:3001/api/dify-proxy"
echo ""
echo "🔧 管理命令:"
echo "   ssh $SERVER_USER@$SERVER_IP"
echo "   cd $REMOTE_PATH"
echo "   pm2 status"
echo "   pm2 logs dify-proxy"
echo ""
echo "📊 下一步: 更新前端配置使用新的代理地址"
