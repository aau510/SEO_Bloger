#!/bin/bash
# 文件名：ssh-diagnosis.sh
# 用途：SSH连接诊断脚本

echo "🔍 SSH连接诊断工具"
echo "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 服务器信息
SERVER_IP="10.61.197.191"
USERNAME="Joyme0411!"
PASSWORD="liveme@2022"

echo "📋 连接信息:"
echo "   服务器: $SERVER_IP"
echo "   用户名: $USERNAME"
echo "   密码: $PASSWORD"
echo ""

# 1. 测试网络连通性
echo "1️⃣ 测试网络连通性..."
ping -c 3 $SERVER_IP
echo ""

# 2. 测试SSH端口
echo "2️⃣ 测试SSH端口 (22)..."
timeout 10 bash -c "</dev/tcp/$SERVER_IP/22" && echo "✅ SSH端口22开放" || echo "❌ SSH端口22不可达"
echo ""

# 3. 测试SSH服务
echo "3️⃣ 测试SSH服务..."
ssh -o ConnectTimeout=10 -o BatchMode=yes $USERNAME@$SERVER_IP exit 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ SSH服务正常，密钥认证可用"
elif [ $? -eq 255 ]; then
    echo "⚠️  SSH服务正常，但需要密码或密钥认证"
else
    echo "❌ SSH服务不可用"
fi
echo ""

# 4. 检查SSH配置
echo "4️⃣ 检查本地SSH配置..."
if [ -f ~/.ssh/config ]; then
    echo "📁 找到SSH配置文件: ~/.ssh/config"
    grep -A 5 -B 5 "$SERVER_IP" ~/.ssh/config 2>/dev/null || echo "   未找到相关配置"
else
    echo "📁 未找到SSH配置文件"
fi
echo ""

# 5. 检查SSH密钥
echo "5️⃣ 检查SSH密钥..."
if [ -f ~/.ssh/id_rsa ]; then
    echo "🔑 找到SSH私钥: ~/.ssh/id_rsa"
    ssh-keygen -l -f ~/.ssh/id_rsa.pub 2>/dev/null || echo "   公钥文件不存在"
else
    echo "🔑 未找到SSH私钥"
fi
echo ""

# 6. 尝试不同的连接方式
echo "6️⃣ 尝试不同的连接方式..."
echo "   方式1: 标准SSH连接"
echo "   ssh '$USERNAME@$SERVER_IP'"
echo ""
echo "   方式2: 指定端口"
echo "   ssh -p 22 '$USERNAME@$SERVER_IP'"
echo ""
echo "   方式3: 强制密码认证"
echo "   ssh -o PreferredAuthentications=password '$USERNAME@$SERVER_IP'"
echo ""
echo "   方式4: 详细输出"
echo "   ssh -v '$USERNAME@$SERVER_IP'"
echo ""

# 7. 提供解决方案
echo "💡 可能的解决方案:"
echo ""
echo "方案1: 确认用户名和密码"
echo "   - 检查用户名是否包含特殊字符"
echo "   - 确认密码是否正确"
echo "   - 尝试使用其他用户账户"
echo ""
echo "方案2: 使用SSH密钥"
echo "   - 生成SSH密钥对: ssh-keygen -t rsa"
echo "   - 将公钥添加到服务器: ssh-copy-id '$USERNAME@$SERVER_IP'"
echo ""
echo "方案3: 检查服务器配置"
echo "   - 确认SSH服务正在运行"
echo "   - 检查防火墙设置"
echo "   - 验证用户账户状态"
echo ""
echo "方案4: 联系服务器管理员"
echo "   - 确认服务器访问权限"
echo "   - 检查SSH配置"
echo "   - 获取正确的登录信息"
echo ""

echo "🎯 建议的下一步操作:"
echo "   1. 手动尝试SSH连接: ssh '$USERNAME@$SERVER_IP'"
echo "   2. 如果连接成功，执行部署命令"
echo "   3. 如果连接失败，联系服务器管理员"
echo ""
echo "📋 部署命令 (连接成功后执行):"
echo "   cd /opt"
echo "   tar -xzf dify-proxy-deployment.tar.gz"
echo "   mv deploy-package dify-proxy"
echo "   cd dify-proxy"
echo "   chmod +x deploy.sh"
echo "   ./deploy.sh"

