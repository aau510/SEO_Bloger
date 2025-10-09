#!/bin/bash
# 文件名：port-scan.sh
# 用途：扫描服务器开放端口

echo "🔍 扫描服务器 10.61.197.191 的开放端口..."
echo "📅 时间: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

SERVER_IP="10.61.197.191"

# 常见端口列表
PORTS=(22 2222 2022 8022 10022 2200 22000 443 80 8080 3000 3001 8000 8001 9000 9001)

echo "📋 扫描常见端口:"
for port in "${PORTS[@]}"; do
    echo -n "   端口 $port: "
    if nc -z -w1 $SERVER_IP $port 2>/dev/null; then
        echo "✅ 开放"
    else
        echo "❌ 关闭"
    fi
done

echo ""
echo "🔍 详细端口扫描 (1-1000)..."
echo "这可能需要几分钟时间..."

# 使用 nmap 进行详细扫描 (如果可用)
if command -v nmap &> /dev/null; then
    echo "使用 nmap 进行详细扫描..."
    nmap -p 1-1000 $SERVER_IP
else
    echo "nmap 未安装，使用简单扫描..."
    for port in {1..1000}; do
        if nc -z -w1 $SERVER_IP $port 2>/dev/null; then
            echo "   端口 $port: 开放"
        fi
    done
fi

echo ""
echo "💡 如果找到开放的SSH端口，请使用以下命令连接:"
echo "   ssh -p [端口号] 'Joyme0411!@10.61.197.191'"
echo ""
echo "例如，如果端口2222开放:"
echo "   ssh -p 2222 'Joyme0411!@10.61.197.191'"

