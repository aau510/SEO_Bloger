#!/usr/bin/expect -f
# 文件名：install-nodejs.sh
# 用途：安装Node.js和npm并重新部署

set timeout 60
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "🚀 安装Node.js和npm并重新部署..."
puts "📤 服务器: $server"
puts "👤 用户: $user"
puts ""

# SSH连接并安装Node.js
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
        puts "📋 开始安装Node.js和npm..."
        
        # 检查是否已安装Node.js
        send "node --version\r"
        expect {
            "command not found" {
                puts "📦 Node.js未安装，开始安装..."
                
                # 安装Node.js (使用yum)
                send "sudo yum update -y\r"
                expect "$ "
                
                send "sudo yum install -y nodejs npm\r"
                expect "$ "
                
                # 如果yum安装失败，尝试使用NodeSource仓库
                send "curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -\r"
                expect "$ "
                
                send "sudo yum install -y nodejs\r"
                expect "$ "
            }
            default {
                puts "✅ Node.js已安装"
            }
        }
        
        # 检查npm
        send "npm --version\r"
        expect "$ "
        
        # 进入部署目录
        send "cd /opt/dify-proxy\r"
        expect "$ "
        
        # 安装依赖
        send "npm install\r"
        expect "$ "
        
        # 安装PM2
        send "sudo npm install -g pm2\r"
        expect "$ "
        
        # 启动服务
        send "pm2 start ecosystem.config.js\r"
        expect "$ "
        
        # 保存PM2配置
        send "pm2 save\r"
        expect "$ "
        
        # 设置开机自启
        send "pm2 startup\r"
        expect "$ "
        
        puts "🎉 Node.js安装和部署完成！"
        puts "📋 验证部署结果..."
        
        # 等待服务启动
        send "sleep 5\r"
        expect "$ "
        
        # 验证部署
        send "curl http://localhost:3001/health\r"
        expect "$ "
        
        # 检查PM2状态
        send "pm2 status\r"
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

