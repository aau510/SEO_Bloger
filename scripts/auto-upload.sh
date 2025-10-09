#!/usr/bin/expect -f
# 文件名：auto-upload.sh
# 用途：自动上传部署包到服务器

set timeout 30
set server "10.61.197.191"
set user "Joyme0411!"
set password "liveme@2022"
set file "dify-proxy-deployment.tar.gz"

puts "🚀 开始自动上传部署包..."
puts "📤 服务器: $server"
puts "👤 用户: $user"
puts "📁 文件: $file"
puts ""

# 使用 scp 上传文件
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
        puts "❌ 权限被拒绝，请检查用户名和密码"
        exit 1
    }
    "Connection refused" {
        puts "❌ 连接被拒绝，请检查服务器地址和端口"
        exit 1
    }
    "No such file or directory" {
        puts "❌ 文件不存在: $file"
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
        puts "✅ 上传完成！"
    }
}

puts ""
puts "🎉 文件上传成功！"
puts "📋 下一步操作:"
puts "   1. SSH 连接服务器: ssh 'Joyme0411!@10.61.197.191'"
puts "   2. 输入密码: liveme@2022"
puts "   3. 执行部署命令"
puts ""
puts "🚀 部署命令:"
puts "   cd /opt"
puts "   tar -xzf dify-proxy-deployment.tar.gz"
puts "   mv deploy-package dify-proxy"
puts "   cd dify-proxy"
puts "   chmod +x deploy.sh"
puts "   ./deploy.sh"
