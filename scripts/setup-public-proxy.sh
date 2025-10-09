#!/usr/bin/expect -f
# 文件名：setup-public-proxy.sh
# 用途：配置代理服务器为公网可访问

set timeout 30
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "🌐 配置代理服务器为公网可访问..."

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
        
        # 检查当前网络配置
        send "ip addr show\r"
        expect "$ "
        
        # 检查是否有公网IP
        send "curl -s ifconfig.me\r"
        expect "$ "
        
        # 检查防火墙配置
        send "sudo firewall-cmd --list-all\r"
        expect "$ "
        
        # 检查代理服务状态
        send "ps aux | grep simple-proxy\r"
        expect "$ "
        
        # 检查端口监听
        send "netstat -tlnp | grep 3001\r"
        expect "$ "
        
        # 测试本地访问
        send "curl http://localhost:3001/health\r"
        expect "$ "
        
        # 测试外部访问
        send "curl http://10.61.197.191:3001/health\r"
        expect "$ "
        
        puts "✅ 网络配置检查完成！"
        puts ""
        puts "🔍 如果服务器有公网IP，我们可以配置端口转发"
        puts "🔍 如果没有公网IP，我们需要使用其他方案"
        
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
