#!/bin/bash
# 文件名：interactive-deploy.sh
# 用途：交互式部署脚本

echo "🚀 交互式部署 Dify 代理服务器"
echo "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 服务器配置
SERVER_IP="10.61.197.191"
SERVER_USER="Joyme0411!"
SERVER_PASS="liveme@2022"
REMOTE_PATH="/opt/dify-proxy"

echo "📋 部署配置:"
echo "   服务器: $SERVER_IP"
echo "   用户: $SERVER_USER"
echo "   密码: $SERVER_PASS"
echo ""

# 检查部署包
if [ ! -f "dify-proxy-deployment.tar.gz" ]; then
    echo "❌ 部署压缩包不存在，请先创建"
    exit 1
fi

echo "✅ 部署压缩包已准备: dify-proxy-deployment.tar.gz"
echo ""

# 创建临时脚本
cat > temp_upload.sh << 'EOF'
#!/bin/bash
echo "📤 开始上传文件..."
echo "请输入密码: liveme@2022"
scp dify-proxy-deployment.tar.gz Joyme0411!@10.61.197.191:/opt/
EOF

chmod +x temp_upload.sh

echo "🔧 方法1: 手动上传 (推荐)"
echo "请执行以下命令:"
echo "   ./temp_upload.sh"
echo ""

echo "🔧 方法2: 使用 SFTP"
echo "请执行以下命令:"
echo "   sftp 'Joyme0411!@10.61.197.191'"
echo "   输入密码: liveme@2022"
echo "   put dify-proxy-deployment.tar.gz /opt/"
echo "   quit"
echo ""

echo "🔧 方法3: 使用 rsync"
echo "请执行以下命令:"
echo "   rsync -avz dify-proxy-deployment.tar.gz 'Joyme0411!@10.61.197.191:/opt/'"
echo ""

echo "📋 上传完成后，请执行以下命令连接服务器:"
echo "   ssh 'Joyme0411!@10.61.197.191'"
echo "   输入密码: liveme@2022"
echo ""

echo "📋 在服务器上执行以下命令:"
echo "   cd /opt"
echo "   tar -xzf dify-proxy-deployment.tar.gz"
echo "   mv deploy-package dify-proxy"
echo "   cd dify-proxy"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"
echo ""

echo "📋 验证部署:"
echo "   curl http://localhost:3001/health"
echo ""

echo "🎯 预期响应:"
echo '   {"status":"ok","timestamp":"...","dify_api":"http://47.90.156.219/v1"}'
echo ""

echo "✅ 部署完成后，前端将自动使用新的代理服务器！"
echo "   代理地址: http://10.61.197.191:3001"

