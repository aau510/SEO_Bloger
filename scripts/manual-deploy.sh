#!/usr/bin/expect -f
# 文件名：manual-deploy.sh
# 用途：手动部署高级代理服务器

set timeout 300
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "🚀 手动部署高级代理服务器..."
spawn ssh "$user@$server"

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
        
        # 创建目录
        send "sudo mkdir -p /opt/dify-advanced-proxy\r"
        expect "$ "
        send "sudo chown admin:admin /opt/dify-advanced-proxy\r"
        expect "$ "
        
        # 移动文件
        send "sudo mv ~/advanced-proxy-server.js ~/package.json /opt/dify-advanced-proxy/\r"
        expect "$ "
        
        # 进入目录
        send "cd /opt/dify-advanced-proxy\r"
        expect "$ "
        
        # 安装依赖
        send "npm install\r"
        expect "$ "
        
        # 停止旧服务
        send "pkill -f advanced-proxy-server\r"
        expect "$ "
        
        # 启动新服务
        send "nohup node advanced-proxy-server.js > proxy.log 2>&1 &\r"
        expect "$ "
        send "echo \$! > proxy.pid\r"
        expect "$ "
        
        # 等待启动
        send "sleep 3\r"
        expect "$ "
        
        # 测试服务
        send "curl http://localhost:3001/health\r"
        expect "$ "
        
        puts "✅ 部署完成！"
        
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
