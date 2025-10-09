#!/bin/bash
# 文件名：start-simple-proxy.sh
# 用途：启动简单的Python代理服务

echo "🚀 启动简单的Dify代理服务器..."
echo "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 检查Python版本
echo "🔍 检查Python环境..."
python3 --version
echo ""

# 创建代理目录
PROXY_DIR="/opt/dify-simple-proxy"
echo "📁 创建代理目录: $PROXY_DIR"
sudo mkdir -p $PROXY_DIR
sudo chown admin:admin $PROXY_DIR

# 复制代理文件
echo "📋 复制代理文件..."
sudo cp simple-proxy.py $PROXY_DIR/
sudo chmod +x $PROXY_DIR/simple-proxy.py
sudo chown admin:admin $PROXY_DIR/simple-proxy.py

# 创建启动脚本
cat > $PROXY_DIR/start.sh << 'EOF'
#!/bin/bash
cd /opt/dify-simple-proxy
nohup python3 simple-proxy.py > proxy.log 2>&1 &
echo $! > proxy.pid
echo "✅ 代理服务已启动，PID: $(cat proxy.pid)"
echo "📋 日志文件: /opt/dify-simple-proxy/proxy.log"
echo "🎯 健康检查: curl http://localhost:3001/health"
EOF

sudo chmod +x $PROXY_DIR/start.sh
sudo chown admin:admin $PROXY_DIR/start.sh

# 创建停止脚本
cat > $PROXY_DIR/stop.sh << 'EOF'
#!/bin/bash
if [ -f proxy.pid ]; then
    PID=$(cat proxy.pid)
    if kill -0 $PID 2>/dev/null; then
        kill $PID
        echo "✅ 代理服务已停止 (PID: $PID)"
        rm -f proxy.pid
    else
        echo "⚠️  代理服务未运行"
        rm -f proxy.pid
    fi
else
    echo "⚠️  未找到PID文件"
fi
EOF

sudo chmod +x $PROXY_DIR/stop.sh
sudo chown admin:admin $PROXY_DIR/stop.sh

# 创建状态检查脚本
cat > $PROXY_DIR/status.sh << 'EOF'
#!/bin/bash
if [ -f proxy.pid ]; then
    PID=$(cat proxy.pid)
    if kill -0 $PID 2>/dev/null; then
        echo "✅ 代理服务正在运行 (PID: $PID)"
        echo "🌐 健康检查:"
        curl -s http://localhost:3001/health | python3 -m json.tool
    else
        echo "❌ 代理服务未运行"
        rm -f proxy.pid
    fi
else
    echo "❌ 代理服务未运行"
fi
EOF

sudo chmod +x $PROXY_DIR/status.sh
sudo chown admin:admin $PROXY_DIR/status.sh

echo "✅ 代理服务文件准备完成!"
echo ""
echo "📋 管理命令:"
echo "   启动: $PROXY_DIR/start.sh"
echo "   停止: $PROXY_DIR/stop.sh"
echo "   状态: $PROXY_DIR/status.sh"
echo ""
echo "🎯 服务地址:"
echo "   健康检查: http://10.61.197.191:3001/health"
echo "   API代理: http://10.61.197.191:3001/api/dify-proxy"
echo ""
echo "📊 日志文件: $PROXY_DIR/proxy.log"
echo ""
echo "🚀 现在启动代理服务..."
cd $PROXY_DIR
./start.sh

