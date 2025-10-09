#!/usr/bin/expect -f
# 文件名：deploy-simple-proxy.sh
# 用途：部署简单的Python代理服务

set timeout 30
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "🚀 部署简单的Dify代理服务器..."
puts "📤 服务器: $server"
puts "👤 用户: $user"
puts ""

# 1. 上传代理文件
puts "📤 步骤1: 上传代理文件..."
spawn scp simple-proxy.py start-simple-proxy.sh $user@$server:~/

expect {
    "password:" {
        send "$password\r"
        exp_continue
    }
    "Password:" {
        send "$password\r"
        exp_continue
    }
    "100%" {
        puts "✅ 文件上传成功！"
    }
    timeout {
        puts "❌ 上传超时"
        exit 1
    }
    eof {
        puts "✅ 文件上传完成！"
    }
}

# 2. SSH连接并部署
puts ""
puts "🔗 步骤2: SSH连接并部署..."
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
        puts "📋 开始部署简单代理服务..."
        
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
        puts "🌐 健康检查: http://10.61.197.191:3001/health"
        puts "🎯 API代理: http://10.61.197.191:3001/api/dify-proxy"
        puts ""
        puts "📋 管理命令:"
        puts "   启动: /opt/dify-simple-proxy/start.sh"
        puts "   停止: /opt/dify-simple-proxy/stop.sh"
        puts "   状态: /opt/dify-simple-proxy/status.sh"
        puts "   日志: tail -f /opt/dify-simple-proxy/proxy.log"
        
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

