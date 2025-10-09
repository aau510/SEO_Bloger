#!/usr/bin/expect -f
# 文件名：upload-and-deploy.sh
# 用途：自动上传文件并部署

set timeout 30
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"
set file "dify-proxy-deployment.tar.gz"

puts "🚀 开始上传文件并部署..."
puts "📤 服务器: $server"
puts "👤 用户: $user"
puts "📁 文件: $file"
puts ""

# 1. 上传文件
puts "📤 步骤1: 上传部署文件..."
spawn scp $file $user@$server:/opt/

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
        puts "❌ 上传权限被拒绝"
        exit 1
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
        puts "📋 开始执行部署命令..."
        
        # 检查文件是否存在
        send "ls -la /opt/dify-proxy-deployment.tar.gz\r"
        expect "$ "
        
        # 解压文件
        send "cd /opt\r"
        expect "$ "
        
        send "tar -xzf dify-proxy-deployment.tar.gz\r"
        expect "$ "
        
        # 重命名目录
        send "mv deploy-package dify-proxy\r"
        expect "$ "
        
        # 进入目录
        send "cd dify-proxy\r"
        expect "$ "
        
        # 设置权限
        send "chmod +x deploy.sh\r"
        expect "$ "
        
        # 执行部署
        send "./deploy.sh\r"
        expect "$ "
        
        puts "🎉 部署完成！"
        puts "📋 验证部署结果..."
        
        # 验证部署
        send "curl http://localhost:3001/health\r"
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

