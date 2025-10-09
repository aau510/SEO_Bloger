#!/usr/bin/expect -f
# 文件名：auto-ssh.sh
# 用途：自动SSH连接到服务器

set timeout 30
set server "10.61.197.191"
set user "Joyme0411!"
set password "liveme@2022"

puts "🔗 开始SSH连接到服务器..."
puts "📤 服务器: $server"
puts "👤 用户: $user"
puts ""

# 使用 ssh 连接服务器
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
    "Permission denied" {
        puts "❌ 权限被拒绝，请检查用户名和密码"
        exit 1
    }
    "Connection refused" {
        puts "❌ 连接被拒绝，请检查服务器地址和端口"
        exit 1
    }
    "Are you sure you want to continue connecting" {
        send "yes\r"
        exp_continue
    }
    "$ " {
        puts "✅ SSH连接成功！"
        puts "📋 您现在在服务器上，可以执行以下命令:"
        puts ""
        puts "1. 检查当前目录:"
        puts "   pwd"
        puts ""
        puts "2. 检查部署文件是否存在:"
        puts "   ls -la /opt/dify-proxy-deployment.tar.gz"
        puts ""
        puts "3. 如果文件存在，执行部署:"
        puts "   cd /opt"
        puts "   tar -xzf dify-proxy-deployment.tar.gz"
        puts "   mv deploy-package dify-proxy"
        puts "   cd dify-proxy"
        puts "   chmod +x deploy.sh"
        puts "   ./deploy.sh"
        puts ""
        puts "4. 验证部署:"
        puts "   curl http://localhost:3001/health"
        puts ""
        puts "🎯 现在您可以执行这些命令了！"
        
        # 保持连接，让用户可以执行命令
        interact
    }
    timeout {
        puts "❌ 连接超时"
        exit 1
    }
    eof {
        puts "❌ 连接意外断开"
        exit 1
    }
}

