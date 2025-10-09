#!/usr/bin/expect -f
# 文件名：create-proxy-on-server.sh
# 用途：直接在服务器上创建简单代理服务

set timeout 30
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "🚀 在服务器上直接创建简单代理服务..."

spawn ssh $user@$server

expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "Password:" {
        send "$password\r"
        exp_continue
    }
    "$ " {
        puts "✅ SSH连接成功！"
        
        # 创建代理目录
        send "sudo mkdir -p /opt/dify-simple-proxy\r"
        expect "$ "
        
        send "sudo chown admin:admin /opt/dify-simple-proxy\r"
        expect "$ "
        
        # 创建简单的Python代理服务
        send "cat > /opt/dify-simple-proxy/simple-proxy.py << 'EOF'\r"
        expect "$ "
        send "#!/usr/bin/env python3\r"
        expect "$ "
        send "import http.server\r"
        expect "$ "
        send "import socketserver\r"
        expect "$ "
        send "import urllib.request\r"
        expect "$ "
        send "import json\r"
        expect "$ "
        send "import sys\r"
        expect "$ "
        send "from urllib.error import HTTPError, URLError\r"
        expect "$ "
        send "\r"
        expect "$ "
        send "DIFY_API_BASE_URL = \"http://47.90.156.219/v1\"\r"
        expect "$ "
        send "DIFY_API_TOKEN = \"app-EVYktrhqnqncQSV9BdDv6uuu\"\r"
        expect "$ "
        send "PROXY_PORT = 3001\r"
        expect "$ "
        send "\r"
        expect "$ "
        send "class DifyProxyHandler(http.server.BaseHTTPRequestHandler):\r"
        expect "$ "
        send "    def do_GET(self):\r"
        expect "$ "
        send "        if self.path == '/health':\r"
        expect "$ "
        send "            self.send_health_response()\r"
        expect "$ "
        send "        else:\r"
        expect "$ "
        send "            self.send_error(404, \"Not Found\")\r"
        expect "$ "
        send "    \r"
        expect "$ "
        send "    def do_POST(self):\r"
        expect "$ "
        send "        if self.path == '/api/dify-proxy':\r"
        expect "$ "
        send "            self.handle_dify_proxy()\r"
        expect "$ "
        send "        else:\r"
        expect "$ "
        send "            self.send_error(404, \"Not Found\")\r"
        expect "$ "
        send "    \r"
        expect "$ "
        send "    def send_health_response(self):\r"
        expect "$ "
        send "        response = {\r"
        expect "$ "
        send "            \"status\": \"ok\",\r"
        expect "$ "
        send "            \"timestamp\": self.date_time_string(),\r"
        expect "$ "
        send "            \"dify_api\": DIFY_API_BASE_URL\r"
        expect "$ "
        send "        }\r"
        expect "$ "
        send "        self.send_response(200)\r"
        expect "$ "
        send "        self.send_header('Content-Type', 'application/json')\r"
        expect "$ "
        send "        self.send_header('Access-Control-Allow-Origin', '*')\r"
        expect "$ "
        send "        self.end_headers()\r"
        expect "$ "
        send "        self.wfile.write(json.dumps(response).encode())\r"
        expect "$ "
        send "    \r"
        expect "$ "
        send "    def handle_dify_proxy(self):\r"
        expect "$ "
        send "        try:\r"
        expect "$ "
        send "            content_length = int(self.headers.get('Content-Length', 0))\r"
        expect "$ "
        send "            post_data = self.rfile.read(content_length)\r"
        expect "$ "
        send "            \r"
        expect "$ "
        send "            url = f\"{DIFY_API_BASE_URL}/workflows/run\"\r"
        expect "$ "
        send "            headers = {\r"
        expect "$ "
        send "                'Authorization': f'Bearer {DIFY_API_TOKEN}',\r"
        expect "$ "
        send "                'Content-Type': 'application/json'\r"
        expect "$ "
        send "            }\r"
        expect "$ "
        send "            \r"
        expect "$ "
        send "            req = urllib.request.Request(url, data=post_data, headers=headers)\r"
        expect "$ "
        send "            \r"
        expect "$ "
        send "            with urllib.request.urlopen(req, timeout=300) as response:\r"
        expect "$ "
        send "                response_data = response.read()\r"
        expect "$ "
        send "                self.send_response(response.status)\r"
        expect "$ "
        send "                self.send_header('Content-Type', 'application/json')\r"
        expect "$ "
        send "                self.send_header('Access-Control-Allow-Origin', '*')\r"
        expect "$ "
        send "                self.end_headers()\r"
        expect "$ "
        send "                self.wfile.write(response_data)\r"
        expect "$ "
        send "                \r"
        expect "$ "
        send "        except Exception as e:\r"
        expect "$ "
        send "            error_response = {\r"
        expect "$ "
        send "                \"error\": \"Proxy Error\",\r"
        expect "$ "
        send "                \"message\": str(e)\r"
        expect "$ "
        send "            }\r"
        expect "$ "
        send "            self.send_response(500)\r"
        expect "$ "
        send "            self.send_header('Content-Type', 'application/json')\r"
        expect "$ "
        send "            self.send_header('Access-Control-Allow-Origin', '*')\r"
        expect "$ "
        send "            self.end_headers()\r"
        expect "$ "
        send "            self.wfile.write(json.dumps(error_response).encode())\r"
        expect "$ "
        send "\r"
        expect "$ "
        send "if __name__ == \"__main__\":\r"
        expect "$ "
        send "    print(\"🚀 启动简单的Dify代理服务器...\")\r"
        expect "$ "
        send "    with socketserver.TCPServer((\"\", PROXY_PORT), DifyProxyHandler) as httpd:\r"
        expect "$ "
        send "        print(f\"✅ 代理服务器启动成功! 端口: {PROXY_PORT}\")\r"
        expect "$ "
        send "        httpd.serve_forever()\r"
        expect "$ "
        send "EOF\r"
        expect "$ "
        
        # 设置权限
        send "chmod +x /opt/dify-simple-proxy/simple-proxy.py\r"
        expect "$ "
        
        # 启动代理服务
        send "cd /opt/dify-simple-proxy\r"
        expect "$ "
        
        send "nohup python3 simple-proxy.py > proxy.log 2>&1 &\r"
        expect "$ "
        
        send "echo $! > proxy.pid\r"
        expect "$ "
        
        puts "🎉 简单代理服务创建并启动完成！"
        puts "📋 验证部署结果..."
        
        # 等待服务启动
        send "sleep 3\r"
        expect "$ "
        
        # 验证部署
        send "curl http://localhost:3001/health\r"
        expect "$ "
        
        # 检查进程
        send "ps aux | grep simple-proxy\r"
        expect "$ "
        
        puts "✅ 部署验证完成！"
        puts "🎯 代理服务器地址: http://10.61.197.191:3001"
        puts "🌐 健康检查: http://10.61.197.191:3001/health"
        puts "🎯 API代理: http://10.61.197.191:3001/api/dify-proxy"
        puts ""
        puts "📋 管理命令:"
        puts "   查看日志: tail -f /opt/dify-simple-proxy/proxy.log"
        puts "   停止服务: kill \$(cat /opt/dify-simple-proxy/proxy.pid)"
        puts "   重启服务: cd /opt/dify-simple-proxy && nohup python3 simple-proxy.py > proxy.log 2>&1 &"
        
        # 保持连接
        interact
    }
    timeout {
        puts "❌ SSH连接超时"
        exit 1
    }
    eof {
        puts "❌ SSH连接意外断开"
        exit 1
    }
}

