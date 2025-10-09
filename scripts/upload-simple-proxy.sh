#!/usr/bin/expect -f
# 文件名：upload-simple-proxy.sh
# 用途：上传简单代理文件

set timeout 30
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"

puts "📤 上传简单代理文件..."

# 上传代理文件
spawn scp scripts/simple-proxy.py scripts/start-simple-proxy.sh $user@$server:~/

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

puts ""
puts "🎯 现在可以SSH连接并部署:"
puts "ssh admin@10.61.197.191"
puts "chmod +x ~/start-simple-proxy.sh"
puts "~/start-simple-proxy.sh"

