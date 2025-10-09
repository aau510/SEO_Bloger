#!/usr/bin/expect -f
# 文件名：check-proxy-status.sh
# 用途：检查代理服务状态

set timeout 30
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "🔍 检查代理服务状态..."

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
        
        # 检查进程
        send "ps aux | grep simple-proxy\r"
        expect "$ "
        
        # 检查端口
        send "netstat -tlnp | grep 3001\r"
        expect "$ "
        
        # 检查日志
        send "tail -10 /opt/dify-simple-proxy/proxy.log\r"
        expect "$ "
        
        # 尝试启动服务
        send "cd /opt/dify-simple-proxy\r"
        expect "$ "
        
        send "python3 simple-proxy.py &\r"
        expect "$ "
        
        send "sleep 2\r"
        expect "$ "
        
        # 再次检查
        send "curl http://localhost:3001/health\r"
        expect "$ "
        
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
