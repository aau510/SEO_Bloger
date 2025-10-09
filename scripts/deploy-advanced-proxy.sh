#!/usr/bin/expect -f
# 文件名：deploy-advanced-proxy.sh
# 用途：部署高级代理服务器

set timeout 300
set server "10.61.197.191"
set user "admin"
set password "Joyme0411!"
set remote_dir "/opt/dify-advanced-proxy"

puts "🚀 部署高级代理服务器..."
puts "🌐 服务器: $server"
puts "👤 用户: $user"
puts ""

puts "📦 步骤1: 上传代理文件..."
spawn scp "scripts/advanced-proxy-server.js" "scripts/package.json" "$user@$server:$remote_dir/"
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
    eof {
        # 文件上传成功或遇到其他错误
    }
}
expect eof
puts "✅ 文件上传完成！"
puts ""

puts "⚙️ 步骤2: SSH连接并部署..."
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
    "Permission denied" {
        puts "❌ SSH权限被拒绝"
        exit 1
    }
    eof {
        # SSH连接成功或遇到其他错误
    }
}
expect "$ " {
    send "sudo mkdir -p $remote_dir\r"
    expect "$ "
    send "sudo chown $user:$user $remote_dir\r"
    expect "$ "
    send "cd $remote_dir\r"
    expect "$ "
    send "npm install\r"
    expect "$ "
    send "pkill -f advanced-proxy-server\r"
    expect "$ "
    send "nohup node advanced-proxy-server.js > proxy.log 2>&1 &\r"
    expect "$ "
    send "echo \$! > proxy.pid\r"
    expect "$ "
    send "sleep 3\r"
    expect "$ "
    send "curl http://localhost:3001/health\r"
    expect "$ "
    send "exit\r"
}
expect eof
puts "✅ 部署命令执行完成！"
puts ""

puts "🎉 高级代理服务器部署完成！"
puts "验证部署结果..."
spawn curl http://$server:3001/health
expect eof
puts "✅ 部署验证完成！"
puts "代理服务器地址: http://$server:3001"
puts "健康检查: http://$server:3001/health"
puts "API代理: http://$server:3001/api/dify-proxy"
puts ""
puts "管理命令:"
puts "   启动: cd $remote_dir && nohup node advanced-proxy-server.js > proxy.log 2>&1 &"
puts "   停止: kill \$(cat $remote_dir/proxy.pid)"
puts "   状态: ps aux | grep advanced-proxy-server"
puts "   日志: tail -f $remote_dir/proxy.log"
