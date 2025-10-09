#!/usr/bin/expect -f
# 文件名：ssh-connect.sh
# 用途：自动SSH连接并执行部署

set timeout 30
set server "10.61.197.191"
set user "Joyme0411!"
set password "liveme@2022"

puts "🔗 开始SSH连接并部署..."
puts "📤 服务器: $server"
puts "👤 用户: $user"
puts ""

# 使用 ssh 连接服务器
spawn ssh -p 22 $user@$server

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
    "Are you sure you want to continue connecting" {
        send "yes\r"
        exp_continue
    }
    "$ " {
        puts "✅ SSH连接成功！"
        puts "📋 开始执行部署命令..."
        
        # 检查部署文件是否存在
        send "ls -la /opt/dify-proxy-deployment.tar.gz\r"
        expect "$ "
        
        # 如果文件存在，执行部署
        send "cd /opt\r"
        expect "$ "
        
        send "tar -xzf dify-proxy-deployment.tar.gz\r"
        expect "$ "
        
        send "mv deploy-package dify-proxy\r"
        expect "$ "
        
        send "cd dify-proxy\r"
        expect "$ "
        
        send "chmod +x deploy.sh\r"
        expect "$ "
        
        send "./deploy.sh\r"
        expect "$ "
        
        puts "🎉 部署完成！"
        puts "📋 验证部署结果..."
        
        send "curl http://localhost:3001/health\r"
        expect "$ "
        
        puts "✅ 部署验证完成！"
        puts "🎯 代理服务器地址: http://10.61.197.191:3001"
        
        # 保持连接
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

