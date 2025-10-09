#!/usr/bin/expect -f
# 文件名：check-proxy-network.sh
# 用途：检查代理服务器的网络配置

set timeout 30
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "🔍 检查代理服务器网络配置..."

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
        
        # 检查代理服务状态
        send "ps aux | grep simple-proxy\r"
        expect "$ "
        
        # 检查端口监听
        send "netstat -tlnp | grep 3001\r"
        expect "$ "
        
        # 检查防火墙状态
        send "sudo firewall-cmd --list-ports\r"
        expect "$ "
        
        # 检查本地访问
        send "curl http://localhost:3001/health\r"
        expect "$ "
        
        # 检查外部访问
        send "curl http://10.61.197.191:3001/health\r"
        expect "$ "
        
        # 检查网络接口
        send "ip addr show\r"
        expect "$ "
        
        # 检查路由表
        send "ip route show\r"
        expect "$ "
        
        puts "✅ 网络配置检查完成！"
        
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
