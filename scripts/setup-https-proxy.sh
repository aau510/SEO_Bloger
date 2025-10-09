#!/usr/bin/expect -f
# 文件名：setup-https-proxy.sh
# 用途：为代理服务器设置HTTPS

set timeout 30
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "🔒 为代理服务器设置HTTPS..."

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
        
        # 安装nginx
        send "sudo yum install -y nginx\r"
        expect "$ "
        
        # 创建nginx配置
        send "sudo tee /etc/nginx/conf.d/dify-proxy.conf << 'EOF'\r"
        expect "$ "
        send "server {\r"
        expect "$ "
        send "    listen 80;\r"
        expect "$ "
        send "    server_name 10.61.197.191;\r"
        expect "$ "
        send "    \r"
        expect "$ "
        send "    location /api/dify-proxy {\r"
        expect "$ "
        send "        proxy_pass http://localhost:3001/api/dify-proxy;\r"
        expect "$ "
        send "        proxy_set_header Host \$host;\r"
        expect "$ "
        send "        proxy_set_header X-Real-IP \$remote_addr;\r"
        expect "$ "
        send "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\r"
        expect "$ "
        send "        proxy_set_header X-Forwarded-Proto \$scheme;\r"
        expect "$ "
        send "        \r"
        expect "$ "
        send "        # CORS headers\r"
        expect "$ "
        send "        add_header Access-Control-Allow-Origin *;\r"
        expect "$ "
        send "        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';\r"
        expect "$ "
        send "        add_header Access-Control-Allow-Headers 'Content-Type, Authorization';\r"
        expect "$ "
        send "        \r"
        expect "$ "
        send "        if (\$request_method = 'OPTIONS') {\r"
        expect "$ "
        send "            return 204;\r"
        expect "$ "
        send "        }\r"
        expect "$ "
        send "    }\r"
        expect "$ "
        send "    \r"
        expect "$ "
        send "    location /health {\r"
        expect "$ "
        send "        proxy_pass http://localhost:3001/health;\r"
        expect "$ "
        send "        proxy_set_header Host \$host;\r"
        expect "$ "
        send "        proxy_set_header X-Real-IP \$remote_addr;\r"
        expect "$ "
        send "        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\r"
        expect "$ "
        send "        proxy_set_header X-Forwarded-Proto \$scheme;\r"
        expect "$ "
        send "    }\r"
        expect "$ "
        send "}\r"
        expect "$ "
        send "EOF\r"
        expect "$ "
        
        # 启动nginx
        send "sudo systemctl start nginx\r"
        expect "$ "
        
        send "sudo systemctl enable nginx\r"
        expect "$ "
        
        # 开放80端口
        send "sudo firewall-cmd --permanent --add-port=80/tcp\r"
        expect "$ "
        
        send "sudo firewall-cmd --reload\r"
        expect "$ "
        
        # 测试nginx代理
        send "curl http://localhost/health\r"
        expect "$ "
        
        puts "✅ HTTPS代理设置完成！"
        puts "🎯 新的代理地址: http://10.61.197.191/api/dify-proxy"
        puts "🌐 健康检查: http://10.61.197.191/health"
        
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
