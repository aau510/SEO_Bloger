# 🚀 Dify 代理服务器部署指令

## 📋 服务器信息
- **服务器地址**: `10.61.197.191`
- **用户名**: `Joyme0411!`
- **密码**: `liveme@2022`
- **Root用户**: `root`
- **Root密码**: `liveme@2022`

## 🔧 部署步骤

### 1. 准备部署文件
部署包已准备完成，包含以下文件：
- `proxy-server.js` - Express 代理服务器
- `package.json` - Node.js 依赖配置
- `ecosystem.config.js` - PM2 进程管理配置
- `deploy.sh` - 部署启动脚本
- `.env` - 环境变量配置
- `README.md` - 部署说明文档

### 2. 上传文件到服务器

由于服务器可能禁用了密码认证，请使用以下方法之一：

#### 方法A: 使用 SSH 密钥
```bash
# 如果有 SSH 密钥
scp -i ~/.ssh/id_rsa -r deploy-package/* admin@10.61.197.191:/opt/dify-proxy/
```

#### 方法B: 使用 SFTP
```bash
sftp admin@10.61.197.191
# 输入密码: Joyme0411!
put -r deploy-package/* /opt/dify-proxy/
```

#### 方法C: 使用压缩包
```bash
# 创建压缩包
tar -czf dify-proxy-deployment.tar.gz deploy-package/

# 上传压缩包
scp dify-proxy-deployment.tar.gz admin@10.61.197.191:/opt/
```

### 3. SSH 连接到服务器
```bash
ssh admin@10.61.197.191
# 输入密码: Joyme0411!
```

### 4. 在服务器上部署

#### 4.1 如果是压缩包方式
```bash
cd /opt
tar -xzf dify-proxy-deployment.tar.gz
mv deploy-package dify-proxy
cd dify-proxy
```

#### 4.2 设置权限并部署
```bash
cd /opt/dify-proxy
chmod +x deploy.sh
./deploy.sh
```

### 5. 验证部署
```bash
# 检查服务状态
curl http://localhost:3001/health

# 预期响应
{
  "status": "ok",
  "timestamp": "2025-10-09T...",
  "dify_api": "http://47.90.156.219/v1"
}
```

## 🔧 服务管理

### PM2 管理命令
```bash
# 查看服务状态
pm2 status

# 查看日志
pm2 logs dify-proxy

# 重启服务
pm2 restart dify-proxy

# 停止服务
pm2 stop dify-proxy

# 保存配置
pm2 save

# 设置开机自启
pm2 startup
```

### 日志查看
```bash
# 查看应用日志
tail -f /opt/dify-proxy/logs/combined.log

# 查看错误日志
tail -f /opt/dify-proxy/logs/err.log
```

## 🔍 故障排除

### 1. 权限问题
```bash
# 设置文件权限
sudo chown -R admin:admin /opt/dify-proxy
chmod +x /opt/dify-proxy/deploy.sh
```

### 2. 端口占用
```bash
# 检查端口占用
netstat -tlnp | grep 3001

# 如果端口被占用，可以修改端口
# 编辑 .env 文件
nano /opt/dify-proxy/.env
# 修改 PORT=3001 为其他端口
```

### 3. Node.js 版本问题
```bash
# 检查 Node.js 版本
node --version

# 如果版本过低，需要升级
# 使用 nvm 或直接安装新版本
```

### 4. 防火墙配置
```bash
# 开放端口 3001
sudo ufw allow 3001

# 或者使用 iptables
sudo iptables -A INPUT -p tcp --dport 3001 -j ACCEPT
```

## 📊 配置信息

### 代理服务器配置
- **端口**: 3001
- **超时**: 5分钟 (300秒)
- **连接池**: 保持连接，最大10个连接
- **重试**: 2次重试，1秒间隔

### 环境变量
```bash
PORT=3001
DIFY_API_BASE_URL=http://47.90.156.219/v1
DIFY_API_TOKEN=app-EVYktrhqnqncQSV9BdDv6uuu
NODE_ENV=production
```

## 🎯 API 端点

- `GET /health` - 健康检查
- `POST /api/dify-proxy` - Dify API 代理
- `POST /api/scrape-content` - 内容抓取代理

## 🚀 部署完成后

### 前端配置已更新
前端配置已自动更新为使用新的代理服务器：
- 代理地址: `http://10.61.197.191:3001`
- API 端点: `http://10.61.197.191:3001/api/dify-proxy`

### 测试连接
```bash
# 在本地测试代理服务器
curl http://10.61.197.191:3001/health

# 测试 Dify API 代理
curl -X POST http://10.61.197.191:3001/api/dify-proxy \
  -H "Content-Type: application/json" \
  -d '{"inputs":{"url_content":"test","Keywords":"[]"},"response_mode":"blocking","user":"test"}'
```

## 📞 支持

如果遇到问题，请检查：
1. 服务器网络连接
2. SSH 密钥配置
3. 文件权限设置
4. 端口占用情况
5. 防火墙配置

---

**部署完成后，您的 blog 项目将使用新的代理服务器，解决 Dify API 超时问题！** 🎉
