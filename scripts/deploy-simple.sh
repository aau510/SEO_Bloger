#!/usr/bin/expect -f
# 文件名：deploy-simple.sh
# 用途：部署简单代理服务

set timeout 30
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "🚀 部署简单代理服务..."

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
        
        # 设置权限
        send "chmod +x ~/start-simple-proxy.sh\r"
        expect "$ "
        
        # 执行部署脚本
        send "~/start-simple-proxy.sh\r"
        expect "$ "
        
        puts "🎉 简单代理服务部署完成！"
        puts "📋 验证部署结果..."
        
        # 等待服务启动
        send "sleep 3\r"
        expect "$ "
        
        # 验证部署
        send "curl http://localhost:3001/health\r"
        expect "$ "
        
        # 检查服务状态
        send "/opt/dify-simple-proxy/status.sh\r"
        expect "$ "
        
        puts "✅ 部署验证完成！"
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

