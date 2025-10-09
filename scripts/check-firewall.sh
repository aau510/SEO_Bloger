#!/usr/bin/expect -f
# 文件名：check-firewall.sh
# 用途：检查防火墙设置

set timeout 30
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "🔍 检查防火墙设置..."

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
        
        # 检查防火墙状态
        send "sudo systemctl status firewalld\r"
        expect "$ "
        
        # 检查端口是否开放
        send "sudo firewall-cmd --list-ports\r"
        expect "$ "
        
        # 开放3001端口
        send "sudo firewall-cmd --permanent --add-port=3001/tcp\r"
        expect "$ "
        
        # 重新加载防火墙
        send "sudo firewall-cmd --reload\r"
        expect "$ "
        
        # 验证端口已开放
        send "sudo firewall-cmd --list-ports\r"
        expect "$ "
        
        # 检查服务是否在监听所有接口
        send "netstat -tlnp | grep 3001\r"
        expect "$ "
        
        # 测试本地访问
        send "curl http://localhost:3001/health\r"
        expect "$ "
        
        # 测试外部访问
        send "curl http://10.61.197.191:3001/health\r"
        expect "$ "
        
        puts "✅ 防火墙配置完成！"
        puts "🎯 代理服务器地址: http://10.61.197.191:3001"
        
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
